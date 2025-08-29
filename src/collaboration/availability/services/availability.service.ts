import { Injectable, NotFoundException, Logger, OptimisticLockCanRetryException, BadRequestException, CACHE_MANAGER, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { UserAvailability } from '../entities/user-availability.entity';
import { CreateUserAvailabilityDto } from '../dto/create-user-availability.dto';
import { UpdateUserAvailabilityDto } from '../dto/update-user-availability.dto';
import { User } from '../../../users/user.entity';
import { InputSanitizationService } from '../../services/input-sanitization.service';
import { PaginationDto } from '../../dto/pagination.dto';
import { CollaborationCacheService } from '../../services/collaboration-cache.service';
import { Cache } from 'cache-manager';

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(
    @InjectRepository(UserAvailability)
    private availabilityRepository: Repository<UserAvailability>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly inputSanitizationService: InputSanitizationService,
    private readonly collaborationCacheService: CollaborationCacheService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async setUserAvailability(userId: string, createUserAvailabilityDto: CreateUserAvailabilityDto): Promise<UserAvailability> {
    // Sanitize inputs
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);
    const sanitizedStartTime = this.inputSanitizationService.sanitizeDate(createUserAvailabilityDto.startTime);
    const sanitizedEndTime = this.inputSanitizationService.sanitizeDate(createUserAvailabilityDto.endTime);
    const sanitizedStatus = this.inputSanitizationService.sanitizeAvailabilityStatus(createUserAvailabilityDto.status);
    const sanitizedNote = createUserAvailabilityDto.note ? this.inputSanitizationService.sanitizeNote(createUserAvailabilityDto.note) : undefined;

    if (!sanitizedUserId || !sanitizedStartTime || !sanitizedEndTime || !sanitizedStatus) {
      throw new BadRequestException('Invalid input parameters');
    }

    // Check if user exists with retry mechanism
    const user = await this.retryOnNetworkFailure(() => 
      this.userRepository.findOne({ where: { id: sanitizedUserId } })
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create the availability record with retry mechanism and concurrency control
    const availability = await this.retryOnNetworkFailure(async () => {
      const newAvailability = this.availabilityRepository.create({
        userId: sanitizedUserId,
        startTime: sanitizedStartTime,
        endTime: sanitizedEndTime,
        status: sanitizedStatus,
        note: sanitizedNote,
      });

      return this.availabilityRepository.save(newAvailability);
    });

    // Invalidate cache for the user
    this.collaborationCacheService.invalidateUserRelatedCache(sanitizedUserId);

    return availability;
  }

  async getUserAvailability(userId: string, paginationDto?: PaginationDto): Promise<{ data: UserAvailability[]; total: number; page: number; limit: number }> {
    // Sanitize inputs
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    if (!sanitizedUserId) {
      throw new BadRequestException('Invalid user ID');
    }

    // Generate cache key
    const cacheKey = this.collaborationCacheService.generateUserAvailabilityCacheKey(sanitizedUserId);

    // Try to get from cache first
    try {
      const cachedResult = await this.cacheManager.get(cacheKey);
      if (cachedResult) {
        this.logger.debug(`Cache hit for user availability: ${cacheKey}`);
        return cachedResult as { data: UserAvailability[]; total: number; page: number; limit: number };
      }
    } catch (error) {
      this.logger.warn(`Cache read failed for user availability: ${error.message}`);
    }

    // Check if user exists with retry mechanism
    const user = await this.retryOnNetworkFailure(() => 
      this.userRepository.findOne({ where: { id: sanitizedUserId } })
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get all availability records for the user with retry mechanism
    const result = await this.retryOnNetworkFailure(async () => {
      const query = this.availabilityRepository.createQueryBuilder('availability')
        .where('availability.userId = :userId', { userId: sanitizedUserId })
        .orderBy('availability.startTime', 'ASC');

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
      this.logger.warn(`Cache write failed for user availability: ${error.message}`);
    }

    return result;
  }

  async getTeamAvailability(userIds: string[], paginationDto?: PaginationDto): Promise<{ data: UserAvailability[]; total: number; page: number; limit: number }> {
    // Sanitize inputs
    const sanitizedUserIds = userIds.map(id => this.inputSanitizationService.sanitizeUuid(id)).filter(id => id !== null) as string[];
    const page = paginationDto?.page || 1;
    const limit = paginationDto?.limit || 10;
    const skip = (page - 1) * limit;

    if (sanitizedUserIds.length === 0) {
      throw new BadRequestException('Invalid user IDs');
    }

    // Generate cache key
    const cacheKey = this.collaborationCacheService.generateTeamAvailabilityCacheKey(sanitizedUserIds);

    // Try to get from cache first
    try {
      const cachedResult = await this.cacheManager.get(cacheKey);
      if (cachedResult) {
        this.logger.debug(`Cache hit for team availability: ${cacheKey}`);
        return cachedResult as { data: UserAvailability[]; total: number; page: number; limit: number };
      }
    } catch (error) {
      this.logger.warn(`Cache read failed for team availability: ${error.message}`);
    }

    // Get availability for all users in the team with retry mechanism
    const result = await this.retryOnNetworkFailure(async () => {
      const query = this.availabilityRepository.createQueryBuilder('availability')
        .where('availability.userId IN (:...userIds)', { userIds: sanitizedUserIds })
        .leftJoinAndSelect('availability.user', 'user')
        .orderBy('availability.startTime', 'ASC');

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
      this.logger.warn(`Cache write failed for team availability: ${error.message}`);
    }

    return result;
  }

  async updateAvailability(availabilityId: string, userId: string, updateUserAvailabilityDto: UpdateUserAvailabilityDto): Promise<UserAvailability> {
    // Sanitize inputs
    const sanitizedAvailabilityId = this.inputSanitizationService.sanitizeUuid(availabilityId);
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);
    const sanitizedStartTime = updateUserAvailabilityDto.startTime ? this.inputSanitizationService.sanitizeDate(updateUserAvailabilityDto.startTime) : undefined;
    const sanitizedEndTime = updateUserAvailabilityDto.endTime ? this.inputSanitizationService.sanitizeDate(updateUserAvailabilityDto.endTime) : undefined;
    const sanitizedStatus = updateUserAvailabilityDto.status ? this.inputSanitizationService.sanitizeAvailabilityStatus(updateUserAvailabilityDto.status) : undefined;
    const sanitizedNote = updateUserAvailabilityDto.note !== undefined ? this.inputSanitizationService.sanitizeNote(updateUserAvailabilityDto.note) : undefined;

    if (!sanitizedAvailabilityId || !sanitizedUserId) {
      throw new BadRequestException('Invalid input parameters');
    }

    const availability = await this.retryOnNetworkFailure(async () => {
      // First, get the current version of the availability record
      const existingAvailability = await this.availabilityRepository.findOne({
        where: { id: sanitizedAvailabilityId, userId: sanitizedUserId }
      });

      if (!existingAvailability) {
        throw new NotFoundException('Availability record not found');
      }

      // Update the availability record with concurrency control
      try {
        if (sanitizedStartTime) {
          existingAvailability.startTime = sanitizedStartTime;
        }
        
        if (sanitizedEndTime) {
          existingAvailability.endTime = sanitizedEndTime;
        }
        
        if (sanitizedStatus) {
          existingAvailability.status = sanitizedStatus;
        }
        
        if (sanitizedNote !== undefined) {
          existingAvailability.note = sanitizedNote;
        }

        return this.availabilityRepository.save(existingAvailability);
      } catch (error) {
        if (error instanceof QueryFailedError && error.message.includes('version')) {
          this.logger.warn(`Concurrency conflict when updating availability ${sanitizedAvailabilityId}`);
          throw new OptimisticLockCanRetryException('Availability record was modified by another user. Please try again.');
        }
        throw error;
      }
    });

    // Invalidate cache for the user
    this.collaborationCacheService.invalidateAvailabilityCache(
      sanitizedAvailabilityId, 
      sanitizedUserId
    );

    return availability;
  }

  async deleteAvailability(availabilityId: string, userId: string): Promise<void> {
    // Sanitize inputs
    const sanitizedAvailabilityId = this.inputSanitizationService.sanitizeUuid(availabilityId);
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);

    if (!sanitizedAvailabilityId || !sanitizedUserId) {
      throw new BadRequestException('Invalid input parameters');
    }

    const availability = await this.retryOnNetworkFailure(async () => {
      // First, get the current version of the availability record
      const existingAvailability = await this.availabilityRepository.findOne({
        where: { id: sanitizedAvailabilityId, userId: sanitizedUserId }
      });

      if (!existingAvailability) {
        throw new NotFoundException('Availability record not found');
      }

      // Delete the availability record with concurrency control
      try {
        await this.availabilityRepository.remove(existingAvailability);
      } catch (error) {
        if (error instanceof QueryFailedError && error.message.includes('version')) {
          this.logger.warn(`Concurrency conflict when deleting availability ${sanitizedAvailabilityId}`);
          throw new OptimisticLockCanRetryException('Availability record was modified by another user. Please try again.');
        }
        throw error;
      }
    });

    // Invalidate cache for the user
    this.collaborationCacheService.invalidateAvailabilityCache(
      sanitizedAvailabilityId, 
      sanitizedUserId
    );
  }

  async getAvailabilityById(availabilityId: string): Promise<UserAvailability> {
    // Sanitize inputs
    const sanitizedAvailabilityId = this.inputSanitizationService.sanitizeUuid(availabilityId);

    if (!sanitizedAvailabilityId) {
      throw new BadRequestException('Invalid availability ID');
    }

    return await this.retryOnNetworkFailure(async () => {
      const availability = await this.availabilityRepository.findOne({
        where: { id: sanitizedAvailabilityId },
        relations: ['user']
      });

      if (!availability) {
        throw new NotFoundException('Availability record not found');
      }

      return availability;
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