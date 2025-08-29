import { Injectable, NotFoundException, ForbiddenException, Logger, OptimisticLockCanRetryException, BadRequestException, CACHE_MANAGER, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { TaskComment } from '../entities/task-comment.entity';
import { CreateTaskCommentDto } from '../dto/create-task-comment.dto';
import { UpdateTaskCommentDto } from '../dto/update-task-comment.dto';
import { Task } from '../../../tasks/entities/task.entity';
import { User } from '../../../users/user.entity';
import { InputSanitizationService } from '../../services/input-sanitization.service';
import { PaginationDto } from '../../dto/pagination.dto';
import { CollaborationCacheService } from '../../services/collaboration-cache.service';
import { StorageLimitationService } from '../../services/storage-limitation.service';
import { Cache } from 'cache-manager';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    @InjectRepository(TaskComment)
    private commentRepository: Repository<TaskComment>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly inputSanitizationService: InputSanitizationService,
    private readonly collaborationCacheService: CollaborationCacheService,
    private readonly storageLimitationService: StorageLimitationService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async addComment(taskId: string, userId: string, createTaskCommentDto: CreateTaskCommentDto): Promise<TaskComment> {
    // Sanitize inputs
    const sanitizedTaskId = this.inputSanitizationService.sanitizeUuid(taskId);
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);
    const sanitizedContent = this.inputSanitizationService.sanitizeText(createTaskCommentDto.content);
    const sanitizedParentId = createTaskCommentDto.parentId ? this.inputSanitizationService.sanitizeUuid(createTaskCommentDto.parentId) : undefined;

    if (!sanitizedTaskId || !sanitizedUserId || !sanitizedContent) {
      throw new BadRequestException('Invalid input parameters');
    }

    // Validate comment length
    this.storageLimitationService.validateCommentLength(sanitizedContent);

    // Check if task exists with retry mechanism
    const task = await this.retryOnNetworkFailure(() => 
      this.taskRepository.findOne({ where: { id: sanitizedTaskId } })
    );
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user exists with retry mechanism
    const user = await this.retryOnNetworkFailure(() => 
      this.userRepository.findOne({ where: { id: sanitizedUserId } })
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check number of existing comments for this task
    const existingCommentCount = await this.retryOnNetworkFailure(() => 
      this.commentRepository.count({ where: { taskId: sanitizedTaskId } })
    );
    
    // Validate comments per task limit
    this.storageLimitationService.validateCommentsPerTask(existingCommentCount);

    // If parentId is provided, check if parent comment exists with retry mechanism
    let parentComment: TaskComment | null = null;
    if (sanitizedParentId) {
      parentComment = await this.retryOnNetworkFailure(() => 
        this.commentRepository.findOne({ where: { id: sanitizedParentId } })
      );
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
      
      // Ensure parent comment belongs to the same task
      if (parentComment.taskId !== sanitizedTaskId) {
        throw new ForbiddenException('Parent comment does not belong to this task');
      }
    }

    // Create the comment with retry mechanism and concurrency control
    const comment = await this.retryOnNetworkFailure(async () => {
      const newComment = this.commentRepository.create({
        taskId: sanitizedTaskId,
        userId: sanitizedUserId,
        content: sanitizedContent,
        parentId: sanitizedParentId,
      });

      return this.commentRepository.save(newComment);
    });

    // Invalidate cache for the task
    this.collaborationCacheService.invalidateTaskRelatedCache(sanitizedTaskId);

    return comment;
  }

  async getCommentsForTask(taskId: string, paginationDto?: PaginationDto): Promise<{ data: TaskComment[]; total: number; page: number; limit: number }> {
    // Sanitize inputs
    const sanitizedTaskId = this.inputSanitizationService.sanitizeUuid(taskId);
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    if (!sanitizedTaskId) {
      throw new BadRequestException('Invalid task ID');
    }

    // Generate cache key
    const cacheKey = this.collaborationCacheService.generateTaskCommentsCacheKey(sanitizedTaskId);

    // Try to get from cache first
    try {
      const cachedResult = await this.cacheManager.get(cacheKey);
      if (cachedResult) {
        this.logger.debug(`Cache hit for task comments: ${cacheKey}`);
        return cachedResult as { data: TaskComment[]; total: number; page: number; limit: number };
      }
    } catch (error) {
      this.logger.warn(`Cache read failed for task comments: ${error.message}`);
    }

    const result = await this.retryOnNetworkFailure(async () => {
      // Check if task exists
      const task = await this.taskRepository.findOne({ where: { id: sanitizedTaskId } });
      if (!task) {
        throw new NotFoundException('Task not found');
      }

      const query = this.commentRepository.createQueryBuilder('comment')
        .where('comment.taskId = :taskId', { taskId: sanitizedTaskId })
        .leftJoinAndSelect('comment.user', 'user')
        .leftJoinAndSelect('comment.parent', 'parent')
        .leftJoinAndSelect('parent.user', 'parentUser')
        .orderBy('comment.createdAt', 'ASC');

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
      this.logger.warn(`Cache write failed for task comments: ${error.message}`);
    }

    return result;
  }

  async updateComment(commentId: string, userId: string, updateTaskCommentDto: UpdateTaskCommentDto): Promise<TaskComment> {
    // Sanitize inputs
    const sanitizedCommentId = this.inputSanitizationService.sanitizeUuid(commentId);
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);
    const sanitizedContent = this.inputSanitizationService.sanitizeText(updateTaskCommentDto.content);

    if (!sanitizedCommentId || !sanitizedUserId || !sanitizedContent) {
      throw new BadRequestException('Invalid input parameters');
    }

    // Validate comment length
    this.storageLimitationService.validateCommentLength(sanitizedContent);

    const comment = await this.retryOnNetworkFailure(async () => {
      // First, get the current version of the comment
      const existingComment = await this.commentRepository.findOne({
        where: { id: sanitizedCommentId },
        relations: ['user']
      });

      if (!existingComment) {
        throw new NotFoundException('Comment not found');
      }

      // Check if user is the author of the comment
      if (existingComment.userId !== sanitizedUserId) {
        throw new ForbiddenException('You do not have permission to update this comment');
      }

      // Update the comment with concurrency control
      try {
        existingComment.content = sanitizedContent;
        return await this.commentRepository.save(existingComment);
      } catch (error) {
        if (error instanceof QueryFailedError && error.message.includes('version')) {
          this.logger.warn(`Concurrency conflict when updating comment ${sanitizedCommentId}`);
          throw new OptimisticLockCanRetryException('Comment was modified by another user. Please try again.');
        }
        throw error;
      }
    });

    // Invalidate cache for the task
    this.collaborationCacheService.invalidateCommentCache(
      sanitizedCommentId, 
      comment.taskId, 
      comment.userId
    );

    return comment;
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    // Sanitize inputs
    const sanitizedCommentId = this.inputSanitizationService.sanitizeUuid(commentId);
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);

    if (!sanitizedCommentId || !sanitizedUserId) {
      throw new BadRequestException('Invalid input parameters');
    }

    const comment = await this.retryOnNetworkFailure(async () => {
      // First, get the current version of the comment
      const existingComment = await this.commentRepository.findOne({
        where: { id: sanitizedCommentId },
        relations: ['user']
      });

      if (!existingComment) {
        throw new NotFoundException('Comment not found');
      }

      // Check if user is the author of the comment
      if (existingComment.userId !== sanitizedUserId) {
        throw new ForbiddenException('You do not have permission to delete this comment');
      }

      // Delete the comment with concurrency control
      try {
        await this.commentRepository.remove(existingComment);
      } catch (error) {
        if (error instanceof QueryFailedError && error.message.includes('version')) {
          this.logger.warn(`Concurrency conflict when deleting comment ${sanitizedCommentId}`);
          throw new OptimisticLockCanRetryException('Comment was modified by another user. Please try again.');
        }
        throw error;
      }
    });

    // Invalidate cache for the task
    this.collaborationCacheService.invalidateCommentCache(
      sanitizedCommentId, 
      comment.taskId, 
      comment.userId
    );
  }

  async getCommentById(commentId: string): Promise<TaskComment> {
    // Sanitize inputs
    const sanitizedCommentId = this.inputSanitizationService.sanitizeUuid(commentId);

    if (!sanitizedCommentId) {
      throw new BadRequestException('Invalid comment ID');
    }

    return await this.retryOnNetworkFailure(async () => {
      const comment = await this.commentRepository.findOne({
        where: { id: sanitizedCommentId },
        relations: ['task', 'user', 'parent', 'parent.user']
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      return comment;
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