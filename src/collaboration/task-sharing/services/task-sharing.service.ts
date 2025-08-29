import { Injectable, NotFoundException, ConflictException, ForbiddenException, Logger, BadRequestException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, OptimisticLockVersionMismatchError } from 'typeorm';
import { TaskShare } from '../entities/task-share.entity';
import { CreateTaskShareDto } from '../dto/create-task-share.dto';
import { UpdateTaskShareDto } from '../dto/update-task-share.dto';
import { Task } from '../../../tasks/entities/task.entity';
import { User } from '../../../users/user.entity';
import { InputSanitizationService } from '../../services/input-sanitization.service';
import { PaginationDto } from '../../dto/pagination.dto';
import { CollaborationCacheService } from '../../services/collaboration-cache.service';
import { PermissionConflictService } from '../../services/permission-conflict.service';
import { TaskAssignment } from '../../task-assignment/entities/task-assignment.entity';
import type { Cache } from 'cache-manager';

@Injectable()
export class TaskSharingService {
  private readonly logger = new Logger(TaskSharingService.name);

  constructor(
    @InjectRepository(TaskShare)
    private taskShareRepository: Repository<TaskShare>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TaskAssignment)
    private taskAssignmentRepository: Repository<TaskAssignment>,
    private readonly inputSanitizationService: InputSanitizationService,
    private readonly collaborationCacheService: CollaborationCacheService,
    private readonly permissionConflictService: PermissionConflictService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async shareTask(taskId: string, ownerId: string, createTaskShareDto: CreateTaskShareDto): Promise<TaskShare> {
    // Sanitize inputs
    const sanitizedTaskId = this.inputSanitizationService.sanitizeUuid(taskId);
    const sanitizedOwnerId = this.inputSanitizationService.sanitizeUuid(ownerId);
    const sanitizedSharedWithId = this.inputSanitizationService.sanitizeUuid(createTaskShareDto.sharedWithId);
    const sanitizedPermissionLevel = this.inputSanitizationService.sanitizePermissionLevel(createTaskShareDto.permissionLevel);

    if (!sanitizedTaskId || !sanitizedOwnerId || !sanitizedSharedWithId || !sanitizedPermissionLevel) {
      throw new BadRequestException('Invalid input parameters');
    }

    // Check if task exists with retry mechanism
    const task = await this.retryOnNetworkFailure(() => 
      this.taskRepository.findOne({ where: { id: sanitizedTaskId } })
    );
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if owner exists with retry mechanism
    const owner = await this.retryOnNetworkFailure(() => 
      this.userRepository.findOne({ where: { id: sanitizedOwnerId } })
    );
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    // Check if sharedWith user exists with retry mechanism
    const sharedWith = await this.retryOnNetworkFailure(() => 
      this.userRepository.findOne({ where: { id: sanitizedSharedWithId } })
    );
    if (!sharedWith) {
      throw new NotFoundException('User to share with not found');
    }

    // Check if task is already shared with this user with retry mechanism
    const existingShare = await this.retryOnNetworkFailure(() => 
      this.taskShareRepository.findOne({
        where: { taskId: sanitizedTaskId, sharedWithId: sanitizedSharedWithId }
      })
    );
    
    if (existingShare) {
      throw new ConflictException('Task already shared with this user');
    }

    // Check if the owner is trying to share with themselves
    if (sanitizedOwnerId === sanitizedSharedWithId) {
      throw new ForbiddenException('Cannot share task with yourself');
    }

    // Check for potential permission conflicts with existing assignments
    const existingAssignment = await this.retryOnNetworkFailure(() => 
      this.taskAssignmentRepository.findOne({
        where: { taskId: sanitizedTaskId, assignedToId: sanitizedSharedWithId }
      })
    );
    
    if (existingAssignment) {
      // Log the potential conflict but allow the sharing to proceed
      this.logger.warn(`Potential permission conflict: User ${sanitizedSharedWithId} is both assigned and shared task ${sanitizedTaskId}`);
    }

    // Create the task share with retry mechanism and concurrency control
    const taskShare = await this.retryOnNetworkFailure(async () => {
      const newTaskShare = this.taskShareRepository.create({
        taskId: sanitizedTaskId,
        ownerId: sanitizedOwnerId,
        sharedWithId: sanitizedSharedWithId,
        permissionLevel: sanitizedPermissionLevel,
      });

      return this.taskShareRepository.save(newTaskShare);
    });

    // Invalidate cache for the shared user
    this.collaborationCacheService.invalidateUserRelatedCache(sanitizedSharedWithId);

    return taskShare;
  }

  async getSharedTasks(userId: string, permissionLevel?: string, status?: string, paginationDto?: PaginationDto): Promise<{ data: TaskShare[]; total: number; page: number; limit: number }> {
    // Sanitize inputs
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);
    const sanitizedPermissionLevel = permissionLevel ? this.inputSanitizationService.sanitizePermissionLevel(permissionLevel) : undefined;
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    if (!sanitizedUserId) {
      throw new BadRequestException('Invalid user ID');
    }

    // Generate cache key
    const cacheKey = this.collaborationCacheService.generateTaskSharesCacheKey(
      sanitizedUserId, 
      sanitizedPermissionLevel || undefined, 
      status
    );

    // Try to get from cache first
    try {
      const cachedResult = await this.cacheManager.get(cacheKey);
      if (cachedResult) {
        this.logger.debug(`Cache hit for shared tasks: ${cacheKey}`);
        return cachedResult as { data: TaskShare[]; total: number; page: number; limit: number };
      }
    } catch (error) {
      this.logger.warn(`Cache read failed for shared tasks: ${error.message}`);
    }

    const result = await this.retryOnNetworkFailure(async () => {
      const query = this.taskShareRepository.createQueryBuilder('taskShare')
        .where('taskShare.sharedWithId = :userId', { userId: sanitizedUserId })
        .leftJoinAndSelect('taskShare.task', 'task')
        .leftJoinAndSelect('taskShare.owner', 'owner')
        .leftJoinAndSelect('taskShare.sharedWith', 'sharedWith');

      if (sanitizedPermissionLevel) {
        query.andWhere('taskShare.permissionLevel = :permissionLevel', { permissionLevel: sanitizedPermissionLevel });
      }

      if (status === 'pending') {
        query.andWhere('taskShare.isAccepted = false AND taskShare.isRevoked = false');
      } else if (status === 'accepted') {
        query.andWhere('taskShare.isAccepted = true AND taskShare.isRevoked = false');
      } else if (status === 'revoked') {
        query.andWhere('taskShare.isRevoked = true');
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
      this.logger.warn(`Cache write failed for shared tasks: ${error.message}`);
    }

    return result;
  }

  async updateSharePermission(shareId: string, userId: string, updateTaskShareDto: UpdateTaskShareDto): Promise<TaskShare> {
    // Sanitize inputs
    const sanitizedShareId = this.inputSanitizationService.sanitizeUuid(shareId);
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);
    const sanitizedPermissionLevel = this.inputSanitizationService.sanitizePermissionLevel(updateTaskShareDto.permissionLevel);

    if (!sanitizedShareId || !sanitizedUserId || !sanitizedPermissionLevel) {
      throw new BadRequestException('Invalid input parameters');
    }

    const taskShare = await this.retryOnNetworkFailure(async () => {
      // First, get the current version of the task share
      const existingTaskShare = await this.taskShareRepository.findOne({
        where: { id: sanitizedShareId },
        relations: ['owner', 'task']
      });

      if (!existingTaskShare) {
        throw new NotFoundException('Task share not found');
      }

      // Check if user is the owner of the share
      if (existingTaskShare.ownerId !== sanitizedUserId) {
        throw new ForbiddenException('You do not have permission to update this share');
      }

      // Validate permission change doesn't create conflicts
      if (!this.permissionConflictService.validatePermissionChange(existingTaskShare, sanitizedPermissionLevel)) {
        throw new ConflictException('Permission change would create conflicts');
      }

      // Update the permission level with concurrency control
      try {
        existingTaskShare.permissionLevel = sanitizedPermissionLevel;
        return await this.taskShareRepository.save(existingTaskShare);
      } catch (error) {
        if (error instanceof QueryFailedError && error.message.includes('version')) {
          this.logger.warn(`Concurrency conflict when updating task share ${sanitizedShareId}`);
          throw new OptimisticLockVersionMismatchError('TaskShare', 0, 0);
        }
        throw error;
      }
    });

    // Invalidate cache for the shared user
    this.collaborationCacheService.invalidateTaskShareCache(
      sanitizedShareId, 
      taskShare.taskId, 
      taskShare.ownerId, 
      taskShare.sharedWithId
    );

    return taskShare;
  }

  async revokeTaskShare(shareId: string, userId: string): Promise<void> {
    // Sanitize inputs
    const sanitizedShareId = this.inputSanitizationService.sanitizeUuid(shareId);
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);

    if (!sanitizedShareId || !sanitizedUserId) {
      throw new BadRequestException('Invalid input parameters');
    }

    const taskShare = await this.retryOnNetworkFailure(async () => {
      // First, get the current version of the task share
      const existingTaskShare = await this.taskShareRepository.findOne({
        where: { id: sanitizedShareId },
        relations: ['owner']
      });

      if (!existingTaskShare) {
        throw new NotFoundException('Task share not found');
      }

      // Check if user is the owner of the share
      if (existingTaskShare.ownerId !== sanitizedUserId) {
        throw new ForbiddenException('You do not have permission to revoke this share');
      }

      // Mark as revoked with concurrency control
      try {
        existingTaskShare.isRevoked = true;
        return await this.taskShareRepository.save(existingTaskShare);
      } catch (error) {
        if (error instanceof QueryFailedError && error.message.includes('version')) {
          this.logger.warn(`Concurrency conflict when revoking task share ${sanitizedShareId}`);
          throw new OptimisticLockVersionMismatchError('TaskShare', 0, 0);
        }
        throw error;
      }
    });

    // Invalidate cache for the shared user
    this.collaborationCacheService.invalidateTaskShareCache(
      sanitizedShareId, 
      taskShare.taskId, 
      taskShare.ownerId, 
      taskShare.sharedWithId
    );
  }

  async acceptTaskShare(shareId: string, userId: string): Promise<TaskShare> {
    // Sanitize inputs
    const sanitizedShareId = this.inputSanitizationService.sanitizeUuid(shareId);
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);

    if (!sanitizedShareId || !sanitizedUserId) {
      throw new BadRequestException('Invalid input parameters');
    }

    const taskShare = await this.retryOnNetworkFailure(async () => {
      // First, get the current version of the task share
      const existingTaskShare = await this.taskShareRepository.findOne({
        where: { id: sanitizedShareId },
        relations: ['sharedWith']
      });

      if (!existingTaskShare) {
        throw new NotFoundException('Task share not found');
      }

      // Check if user is the one the task was shared with
      if (existingTaskShare.sharedWithId !== sanitizedUserId) {
        throw new ForbiddenException('You do not have permission to accept this share');
      }

      // Check if already accepted
      if (existingTaskShare.isAccepted) {
        throw new ConflictException('Share already accepted');
      }

      // Accept the share with concurrency control
      try {
        existingTaskShare.isAccepted = true;
        existingTaskShare.acceptedAt = new Date();
        return await this.taskShareRepository.save(existingTaskShare);
      } catch (error) {
        if (error instanceof QueryFailedError && error.message.includes('version')) {
          this.logger.warn(`Concurrency conflict when accepting task share ${sanitizedShareId}`);
          throw new OptimisticLockVersionMismatchError('TaskShare', 0, 0);
        }
        throw error;
      }
    });

    // Invalidate cache for the shared user
    this.collaborationCacheService.invalidateTaskShareCache(
      sanitizedShareId, 
      taskShare.taskId, 
      taskShare.ownerId, 
      taskShare.sharedWithId
    );

    return taskShare;
  }

  async getTaskShareById(shareId: string): Promise<TaskShare> {
    return await this.retryOnNetworkFailure(async () => {
      const taskShare = await this.taskShareRepository.findOne({
        where: { id: shareId },
        relations: ['task', 'owner', 'sharedWith']
      });

      if (!taskShare) {
        throw new NotFoundException('Task share not found');
      }

      return taskShare;
    });
  }

  /**
   * Get task share by task ID and user ID
   * @param taskId The task ID
   * @param userId The user ID
   * @returns The task share or null if not found
   */
  async getTaskShareByTaskAndUser(taskId: string, userId: string): Promise<TaskShare | null> {
    return await this.retryOnNetworkFailure(async () => {
      return await this.taskShareRepository.findOne({
        where: { taskId, sharedWithId: userId }
      });
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
    let lastError: Error = new Error('Unknown error');

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