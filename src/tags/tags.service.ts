import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  async create(tag: Partial<Tag>): Promise<Tag> {
    const newTag = this.tagsRepository.create(tag);
    return this.tagsRepository.save(newTag);
  }

  async findAll(): Promise<Tag[]> {
    return this.tagsRepository.find();
  }

  async findOne(id: string): Promise<Tag> {
    return this.tagsRepository.findOne({ where: { id } });
  }

  async update(id: string, tag: Partial<Tag>): Promise<Tag> {
    await this.tagsRepository.update(id, tag);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.tagsRepository.delete(id);
  }
}