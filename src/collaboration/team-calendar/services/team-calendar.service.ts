import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../../../users/user.entity';
import { TimeBlock } from '../../../time-blocks/entities/time-block.entity';
import { UserAvailability } from '../../availability/entities/user-availability.entity';
import { InputSanitizationService } from '../../services/input-sanitization.service';
import { VirtualScrollingService } from '../../../time-blocks/services/virtual-scrolling.service';
import { CalendarTimeBlockDto } from '../../../time-blocks/dto/calendar-time-block.dto';

@Injectable()
export class TeamCalendarService {
  private readonly logger = new Logger(TeamCalendarService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TimeBlock)
    private timeBlockRepository: Repository<TimeBlock>,
    @InjectRepository(UserAvailability)
    private availabilityRepository: Repository<UserAvailability>,
    private readonly inputSanitizationService: InputSanitizationService,
    private readonly virtualScrollingService: VirtualScrollingService,
  ) {}

  async getTeamCalendarData(
    userIds: string[], 
    startDate?: string, 
    endDate?: string,
    page: number = 1,
    limit: number = 50,
    search?: string
  ) {
    // Sanitize inputs
    const sanitizedUserIds = userIds.map(id => this.inputSanitizationService.sanitizeUuid(id)).filter(id => id !== null) as string[];
    const sanitizedStartDate = startDate ? this.inputSanitizationService.sanitizeDate(startDate) : undefined;
    const sanitizedEndDate = endDate ? this.inputSanitizationService.sanitizeDate(endDate) : undefined;
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.min(Math.max(1, limit), 100); // Limit between 1 and 100
    const sanitizedSearch = search ? this.inputSanitizationService.sanitizeText(search) : undefined;

    if (sanitizedUserIds.length === 0) {
      throw new BadRequestException('Invalid user IDs');
    }

    return await this.retryOnNetworkFailure(async () => {
      // Validate that all users exist
      const users = await this.userRepository.find({
        where: {
          id: In(sanitizedUserIds)
        }
      });

      const foundUserIds = users.map(user => user.id);
      const missingUserIds = sanitizedUserIds.filter(id => !foundUserIds.includes(id));
      
      if (missingUserIds.length > 0) {
        throw new NotFoundException(`Users not found: ${missingUserIds.join(', ')}`);
      }

      // Build query for time blocks
      const timeBlockQuery = this.timeBlockRepository.createQueryBuilder('timeBlock')
        .where('timeBlock.userId IN (:...userIds)', { userIds: sanitizedUserIds })
        .leftJoinAndSelect('timeBlock.user', 'user')
        .orderBy('timeBlock.startTime', 'ASC');

      // Add date filters if provided
      if (sanitizedStartDate) {
        timeBlockQuery.andWhere('timeBlock.endTime >= :startDate', { startDate: sanitizedStartDate });
      }
      
      if (sanitizedEndDate) {
        timeBlockQuery.andWhere('timeBlock.startTime <= :endDate', { endDate: sanitizedEndDate });
      }

      // Build query for availability
      const availabilityQuery = this.availabilityRepository.createQueryBuilder('availability')
        .where('availability.userId IN (:...userIds)', { userIds: sanitizedUserIds })
        .leftJoinAndSelect('availability.user', 'user')
        .orderBy('availability.startTime', 'ASC');

      // Add date filters for availability if provided
      if (sanitizedStartDate) {
        availabilityQuery.andWhere('availability.endTime >= :startDate', { startDate: sanitizedStartDate });
      }
      
      if (sanitizedEndDate) {
        availabilityQuery.andWhere('availability.startTime <= :endDate', { endDate: sanitizedEndDate });
      }

      // Execute both queries
      const [timeBlocks, availability] = await Promise.all([
        timeBlockQuery.getMany(),
        availabilityQuery.getMany()
      ]);

      // Apply pagination and filtering using the virtual scrolling service
      const paginatedTimeBlocks = this.virtualScrollingService.applyAdvancedVirtualScrolling(
        timeBlocks,
        {
          page: sanitizedPage,
          limit: sanitizedLimit,
          search: sanitizedSearch,
          sortBy: 'startTime',
          sortOrder: 'asc'
        }
      );

      return {
        timeBlocks: paginatedTimeBlocks.timeBlocks,
        availability,
        pagination: {
          total: paginatedTimeBlocks.total,
          page: paginatedTimeBlocks.page,
          limit: paginatedTimeBlocks.limit,
          totalPages: paginatedTimeBlocks.totalPages
        }
      };
    });
  }

  async getUserCalendarData(
    userId: string, 
    startDate?: string, 
    endDate?: string,
    page: number = 1,
    limit: number = 50,
    search?: string
  ) {
    // Sanitize inputs
    const sanitizedUserId = this.inputSanitizationService.sanitizeUuid(userId);
    const sanitizedStartDate = startDate ? this.inputSanitizationService.sanitizeDate(startDate) : undefined;
    const sanitizedEndDate = endDate ? this.inputSanitizationService.sanitizeDate(endDate) : undefined;
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.min(Math.max(1, limit), 100); // Limit between 1 and 100
    const sanitizedSearch = search ? this.inputSanitizationService.sanitizeText(search) : undefined;

    if (!sanitizedUserId) {
      throw new BadRequestException('Invalid user ID');
    }

    return await this.retryOnNetworkFailure(async () => {
      // Validate that user exists
      const user = await this.userRepository.findOne({ where: { id: sanitizedUserId } });
      if (!user) {
        throw new NotFoundException(`User not found: ${sanitizedUserId}`);
      }

      // Build query for time blocks
      const timeBlockQuery = this.timeBlockRepository.createQueryBuilder('timeBlock')
        .where('timeBlock.userId = :userId', { userId: sanitizedUserId })
        .orderBy('timeBlock.startTime', 'ASC');

      // Add date filters if provided
      if (sanitizedStartDate) {
        timeBlockQuery.andWhere('timeBlock.endTime >= :startDate', { startDate: sanitizedStartDate });
      }
      
      if (sanitizedEndDate) {
        timeBlockQuery.andWhere('timeBlock.startTime <= :endDate', { endDate: sanitizedEndDate });
      }

      // Build query for availability
      const availabilityQuery = this.availabilityRepository.createQueryBuilder('availability')
        .where('availability.userId = :userId', { userId: sanitizedUserId })
        .orderBy('availability.startTime', 'ASC');

      // Add date filters for availability if provided
      if (sanitizedStartDate) {
        availabilityQuery.andWhere('availability.endTime >= :startDate', { startDate: sanitizedStartDate });
      }
      
      if (sanitizedEndDate) {
        availabilityQuery.andWhere('availability.startTime <= :endDate', { endDate: sanitizedEndDate });
      }

      // Execute both queries
      const [timeBlocks, availability] = await Promise.all([
        timeBlockQuery.getMany(),
        availabilityQuery.getMany()
      ]);

      // Apply pagination and filtering using the virtual scrolling service
      const paginatedTimeBlocks = this.virtualScrollingService.applyAdvancedVirtualScrolling(
        timeBlocks,
        {
          page: sanitizedPage,
          limit: sanitizedLimit,
          search: sanitizedSearch,
          sortBy: 'startTime',
          sortOrder: 'asc'
        }
      );

      return {
        user,
        timeBlocks: paginatedTimeBlocks.timeBlocks,
        availability,
        pagination: {
          total: paginatedTimeBlocks.total,
          page: paginatedTimeBlocks.page,
          limit: paginatedTimeBlocks.limit,
          totalPages: paginatedTimeBlocks.totalPages
        }
      };
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