import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(project: Partial<Project>): Promise<Project> {
    const newProject = this.projectsRepository.create(project);
    return this.projectsRepository.save(newProject);
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.find();
  }

  async findOne(id: string): Promise<Project> {
    return this.projectsRepository.findOne({ where: { id } });
  }

  async update(id: string, project: Partial<Project>): Promise<Project> {
    await this.projectsRepository.update(id, project);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.projectsRepository.delete(id);
  }
}