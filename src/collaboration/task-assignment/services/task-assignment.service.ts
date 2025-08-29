import { Injectable, NotFoundException, ConflictException, ForbiddenException, Logger, OptimisticLockCanRetryException, BadRequestException, CACHE_MANAGER, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { TaskAssignment } from '../entities/task-assignment.entity';
import { CreateTaskAssignmentDto } from '../dto/create-task-assignment.dto';
import { UpdateTaskAssignmentStatusDto } from '../dto/update-task-assignment-status.dto';
import { Task } from '../../../tasks/entities/task.entity';
import { User } from '../../../users/user.entity';
import { InputSanitizationService } from '../../services/input-sanitization.service';
import { PaginationDto } from '../../dto/pagination.dto';
import { CollaborationCacheService } from '../../services/collaboration-cache.service';
import { Cache } from 'cache-manager';

@Injectable()
export class TaskAssignmentService {
  private readonly logger = new Logger(TaskAssignmentService.name);

  constructor(
    @InjectRepository(TaskAssignment)
    private taskAssignmentRepository: Repository<TaskAssignment>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly inputSanitizationService: InputSanitizationService,
    private readonly collaborationCacheService: CollaborationCacheService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async assignTask(taskId: string, assignedById: string, createTaskAssignmentDto: CreateTaskAssignmentDto): Promise<TaskAssignment> {
    // Sanitize inputs
    const sanitizedTaskId = this.inputSanitizationService.sanitizeUuid(taskId);
    const sanitizedAssignedById = this.inputSanitizationService.sanitizeUuid(assignedById);
    const sanitizedAssignedToId = this.inputSanitizationService.sanitizeUuid(createTaskAssignmentDto.assignedToId);

    if (!sanitizedTaskId || !sanitizedAssignedById || !sanitizedAssignedToId) {
      throw new BadRequestException('Invalid input parameters');
    }

    // Check if task exists with retry mechanism
    const task = await this.retryOnNetworkFailure(() => 
      this.taskRepository.findOne({ where: { id: sanitizedTaskId } })
    );
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if assignedBy user exists with retry mechanism
    const assignedBy = await this.retryOnNetworkFailure(() => 
      this.userRepository.findOne({ where: { id: sanitizedAssignedById } })
    );
    if (!assignedBy) {
      throw new NotFoundException('Assigning user not found');
    }

    // Check if assignedTo user exists with retry mechanism
    const assignedTo = await this.retryOnNetworkFailure(() => 
      this.userRepository.findOne({ where: { id: sanitizedAssignedToId } })
    );
    if (!assignedTo) {
      throw new NotFoundException('User to assign to not found');
    }

    // Check if task is already assigned to this user with retry mechanism
    const existingAssignment = await this.retryOnNetworkFailure(() => 
      this.taskAssignmentRepository.findOne({
        where: { taskId: sanitizedTaskId, assignedToId: sanitizedAssignedToId }
      })
    );
    
    if (existingAssignment) {
      throw new ConflictException('Task already assigned to this user');
    }

    // Check if the assignedBy is trying to assign to themselves
    if (sanitizedAssignedById === sanitizedAssignedToId) {
      throw new ForbiddenException('Cannot assign task to yourself');
    }

    // Create the task assignment with retry mechanism and concurrency control
    const taskAssignment = await this.retryOnNetworkFailure(async () => {
      const newTaskAssignment = this.taskAssignmentRepository.create({
        taskId: sanitizedTaskId,
        assignedById: sanitizedAssignedById,
        assignedToId: sanitizedAssignedToId,
      });

      return this.taskAssignmentRepository.save(newTaskAssignment);
    });

    // Invalidate cache for the assigned user
    this.collaborationCacheService.invalidateUserRelatedCache(sanitizedAssignedToId);

    return taskAssignment;
  }

  async getAssignedTasks(userId: string, status?: string, paginationDto?: PaginationDto): Promise<{ data: TaskAssignment[]; total: number; page: number; limit: number }> {
    // Sanitize inputs
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);
    const sanitizedStatus = status ? this.inputSanitizationService.sanitizeAssignmentStatus(status) : undefined;
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    if (!sanitizedUserId) {
      throw new BadRequestException('Invalid user ID');
    }

    // Generate cache key
    const cacheKey = this.collaborationCacheService.generateTaskAssignmentsCacheKey(
      sanitizedUserId, 
      sanitizedStatus
    );

    // Try to get from cache first
    try {
      const cachedResult = await this.cacheManager.get(cacheKey);
      if (cachedResult) {
        this.logger.debug(`Cache hit for assigned tasks: ${cacheKey}`);
        return cachedResult as { data: TaskAssignment[]; total: number; page: number; limit: number };
      }
    } catch (error) {
      this.logger.warn(`Cache read failed for assigned tasks: ${error.message}`);
    }

    const result = await this.retryOnNetworkFailure(async () => {
      const query = this.taskAssignmentRepository.createQueryBuilder('taskAssignment')
        .where('taskAssignment.assignedToId = :userId', { userId: sanitizedUserId })
        .leftJoinAndSelect('taskAssignment.task', 'task')
        .leftJoinAndSelect('taskAssignment.assignedBy', 'assignedBy')
        .leftJoinAndSelect('taskAssignment.assignedTo', 'assignedTo');

      if (sanitizedStatus) {
        query.andWhere('taskAssignment.status = :status', { status: sanitizedStatus });
      }

      // Get total count
      const total = await query.getCount();

      // Add pagination
      query.skip(skip).take(limit);

      const data = await query.getMany();

      return {
        data,
        total,
        page,
        limit
      };
    });

    // Cache the result
    try {
      await this.cacheManager.set(cacheKey, result, 300000); // Cache for 5 minutes
    } catch (error) {
      this.logger.warn(`Cache write failed for assigned tasks: ${error.message}`);
    }

    return result;
  }

  async updateAssignmentStatus(assignmentId: string, userId: string, updateTaskAssignmentStatusDto: UpdateTaskAssignmentStatusDto): Promise<TaskAssignment> {
    // Sanitize inputs
    const sanitizedAssignmentId = this.inputSanitizationService.sanitizeUuid(assignmentId);
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);
    const sanitizedStatus = this.inputSanitizationService.sanitizeAssignmentStatus(updateTaskAssignmentStatusDto.status);

    if (!sanitizedAssignmentId || !sanitizedUserId || !sanitizedStatus) {
      throw new BadRequestException('Invalid input parameters');
    }

    const taskAssignment = await this.retryOnNetworkFailure(async () => {
      // First, get the current version of the task assignment
      const existingTaskAssignment = await this.taskAssignmentRepository.findOne({
        where: { id: sanitizedAssignmentId },
        relations: ['assignedTo']
      });

      if (!existingTaskAssignment) {
        throw new NotFoundException('Task assignment not found');
      }

      // Check if user is the one the task was assigned to
      if (existingTaskAssignment.assignedToId !== sanitizedUserId) {
        throw new ForbiddenException('You do not have permission to update this assignment');
      }

      // Check if status transition is valid
      if (existingTaskAssignment.status === 'completed' && sanitizedStatus !== 'completed') {
        throw new ConflictException('Cannot change status of a completed assignment');
      }

      // Update the status with concurrency control
      try {
        existingTaskAssignment.status = sanitizedStatus;
        return await this.taskAssignmentRepository.save(existingTaskAssignment);
      } catch (error) {
        if (error instanceof QueryFailedError && error.message.includes('version')) {
          this.logger.warn(`Concurrency conflict when updating task assignment ${sanitizedAssignmentId}`);
          throw new OptimisticLockCanRetryException('Task assignment was modified by another user. Please try again.');
        }
        throw error;
      }
    });

    // Invalidate cache for the assigned user
    this.collaborationCacheService.invalidateTaskAssignmentCache(
      sanitizedAssignmentId, 
      taskAssignment.taskId, 
      taskAssignment.assignedById, 
      taskAssignment.assignedToId
    );

    return taskAssignment;
  }

  async getTaskAssignmentById(assignmentId: string): Promise<TaskAssignment> {
    // Sanitize inputs
    const sanitizedAssignmentId = this.inputSanitizationService.sanitizeUuid(assignmentId);

    if (!sanitizedAssignmentId) {
      throw new BadRequestException('Invalid assignment ID');
    }

    return await this.retryOnNetworkFailure(async () => {
      const taskAssignment = await this.taskAssignmentRepository.findOne({
        where: { id: sanitizedAssignmentId },
        relations: ['task', 'assignedBy', 'assignedTo']
      });

      if (!taskAssignment) {
        throw new NotFoundException('Task assignment not found');
      }

      return taskAssignment;
    });
  }

  /**
   * Retry mechanism for handling network failures
   * @param operation The operation to retry
   * @param maxRetries Maximum number of retries (default: 3)
   * @param delay Delay between retries in milliseconds (default: 1000)
   */
  private async retryOnNetworkFailure<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.logger.warn(`Attempt ${attempt} failed: ${error.message}`);
        
        // If this is the last attempt, rethrow the error
        if (attempt === maxRetries) {
          this.logger.error(`All ${maxRetries} attempts failed. Last error: ${error.message}`);
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    // This should never be reached, but TypeScript requires it
    throw lastError;
  }
}