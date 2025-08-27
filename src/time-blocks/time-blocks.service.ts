import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, Not } from 'typeorm';
import { TimeBlock } from './entities/time-block.entity';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';
import { UpdateTimeBlockDto } from './dto/update-time-block.dto';
import { TimeBlockConflictException } from './exceptions/time-block-conflict.exception';

@Injectable()
export class TimeBlocksService {
  constructor(
    @InjectRepository(TimeBlock)
    private timeBlocksRepository: Repository<TimeBlock>,
  ) {}

  async create(userId: string, createTimeBlockDto: CreateTimeBlockDto): Promise<TimeBlock> {
    // Validate time range
    const startTime = new Date(createTimeBlockDto.startTime);
    const endTime = new Date(createTimeBlockDto.endTime);
    
    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for conflicts
    const conflicts = await this.findConflictingTimeBlocks(
      userId,
      startTime,
      endTime,
    );

    if (conflicts.length > 0) {
      throw new TimeBlockConflictException(conflicts);
    }

    // Create time block
    const timeBlock = this.timeBlocksRepository.create({
      ...createTimeBlockDto,
      startTime,
      endTime,
      userId,
    });

    return this.timeBlocksRepository.save(timeBlock);
  }

  async findAll(userId: string, startDate?: Date, endDate?: Date): Promise<TimeBlock[]> {
    const query: any = { userId };
    
    if (startDate && endDate) {
      // Find time blocks that overlap with the given date range
      query.startTime = LessThanOrEqual(endDate);
      query.endTime = MoreThanOrEqual(startDate);
    } else if (startDate) {
      query.endTime = MoreThanOrEqual(startDate);
    } else if (endDate) {
      query.startTime = LessThanOrEqual(endDate);
    }

    return this.timeBlocksRepository.find({ where: query });
  }

  async findOne(userId: string, id: string): Promise<TimeBlock> {
    const timeBlock = await this.timeBlocksRepository.findOne({ 
      where: { id, userId } 
    });
    
    if (!timeBlock) {
      throw new NotFoundException('Time block not found');
    }
    
    return timeBlock;
  }

  async update(userId: string, id: string, updateTimeBlockDto: UpdateTimeBlockDto): Promise<TimeBlock> {
    // Verify ownership
    const existingTimeBlock = await this.findOne(userId, id);
    
    // Prepare updated time block data
    const updatedTimeBlockData: any = { ...updateTimeBlockDto };
    
    // Convert string dates to Date objects if provided
    if (updateTimeBlockDto.startTime) {
      updatedTimeBlockData.startTime = new Date(updateTimeBlockDto.startTime);
    }
    
    if (updateTimeBlockDto.endTime) {
      updatedTimeBlockData.endTime = new Date(updateTimeBlockDto.endTime);
    }
    
    // Validate time range
    const startTimeToCheck = updatedTimeBlockData.startTime || existingTimeBlock.startTime;
    const endTimeToCheck = updatedTimeBlockData.endTime || existingTimeBlock.endTime;
    
    if (startTimeToCheck >= endTimeToCheck) {
      throw new BadRequestException('End time must be after start time');
    }
    
    // Check for conflicts if time range is being updated
    if (updateTimeBlockDto.startTime || updateTimeBlockDto.endTime) {
      const conflicts = await this.findConflictingTimeBlocks(
        userId,
        startTimeToCheck,
        endTimeToCheck,
        id, // Exclude the current time block from conflict check
      );
      
      if (conflicts.length > 0) {
        throw new TimeBlockConflictException(conflicts);
      }
    }
    
    // Update the time block
    await this.timeBlocksRepository.update(id, updatedTimeBlockData);
    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string): Promise<void> {
    // Verify ownership
    await this.findOne(userId, id);
    
    // Delete the time block
    await this.timeBlocksRepository.delete({ id, userId });
  }

  /**
   * Find conflicting time blocks for a user within a given time range
   * @param userId The user ID
   * @param startTime The start time of the new time block
   * @param endTime The end time of the new time block
   * @param excludeId Optional ID to exclude from conflict check (for updates)
   * @returns Array of conflicting time blocks
   */
  private async findConflictingTimeBlocks(
    userId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<TimeBlock[]> {
    // Find time blocks where:
    // newStart < existingEnd AND existingStart < newEnd
    const query: any = {
      userId,
      startTime: LessThanOrEqual(endTime),
      endTime: MoreThanOrEqual(startTime),
    };
    
    if (excludeId) {
      query.id = Not(excludeId);
    }
    
    return this.timeBlocksRepository.find({
      where: query,
    });
  }
}