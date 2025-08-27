import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeBlock } from './entities/time-block.entity';

@Injectable()
export class TimeBlocksService {
  constructor(
    @InjectRepository(TimeBlock)
    private timeBlocksRepository: Repository<TimeBlock>,
  ) {}

  async create(timeBlock: Partial<TimeBlock>): Promise<TimeBlock> {
    const newTimeBlock = this.timeBlocksRepository.create(timeBlock);
    return this.timeBlocksRepository.save(newTimeBlock);
  }

  async findAll(): Promise<TimeBlock[]> {
    return this.timeBlocksRepository.find();
  }

  async findOne(id: string): Promise<TimeBlock> {
    const timeBlock = await this.timeBlocksRepository.findOne({ where: { id } });
    if (!timeBlock) {
      throw new NotFoundException('Time block not found');
    }
    return timeBlock;
  }

  async update(id: string, timeBlock: Partial<TimeBlock>): Promise<TimeBlock> {
    await this.timeBlocksRepository.update(id, timeBlock);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.timeBlocksRepository.delete(id);
  }
}