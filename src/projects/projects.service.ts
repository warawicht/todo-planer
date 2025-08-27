import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(userId: string, createProjectDto: CreateProjectDto): Promise<Project> {
    // Check if user already has a project with the same name
    const existingProject = await this.projectsRepository.findOne({
      where: { name: createProjectDto.name, userId }
    });
    
    if (existingProject) {
      throw new BadRequestException('A project with this name already exists');
    }
    
    const project = this.projectsRepository.create({
      ...createProjectDto,
      userId,
      isArchived: false,
    });
    
    return this.projectsRepository.save(project);
  }

  async findAll(userId: string, isArchived?: boolean): Promise<Project[]> {
    const queryBuilder = this.projectsRepository.createQueryBuilder('project');
    queryBuilder.where('project.userId = :userId', { userId });
    
    if (isArchived !== undefined) {
      queryBuilder.andWhere('project.isArchived = :isArchived', { isArchived });
    }
    
    return queryBuilder.getMany();
  }

  async findAllWithPagination(
    userId: string, 
    page: number = 1, 
    limit: number = 10, 
    isArchived?: boolean
  ): Promise<{ projects: Project[]; total: number }> {
    const queryBuilder = this.projectsRepository.createQueryBuilder('project');
    queryBuilder.where('project.userId = :userId', { userId });
    
    if (isArchived !== undefined) {
      queryBuilder.andWhere('project.isArchived = :isArchived', { isArchived });
    }
    
    const [projects, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
      
    return { projects, total };
  }

  async findOne(id: string, userId: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({ 
      where: { id, userId },
      relations: ['tasks']
    });
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    
    return project;
  }

  async update(id: string, userId: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    // Check if project belongs to user
    const project = await this.projectsRepository.findOne({ where: { id, userId } });
    if (!project) {
      throw new ForbiddenException('Project not found or access denied');
    }
    
    // If name is being updated, check for uniqueness
    if (updateProjectDto.name && updateProjectDto.name !== project.name) {
      const existingProject = await this.projectsRepository.findOne({
        where: { name: updateProjectDto.name, userId }
      });
      
      if (existingProject) {
        throw new BadRequestException('A project with this name already exists');
      }
    }
    
    await this.projectsRepository.update(id, updateProjectDto);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Check if project belongs to user
    const project = await this.projectsRepository.findOne({ where: { id, userId } });
    if (!project) {
      throw new ForbiddenException('Project not found or access denied');
    }
    
    await this.projectsRepository.delete(id);
  }
  
  async assignTaskToProject(projectId: string, taskId: string, userId: string): Promise<Task> {
    // Check if project belongs to user
    const project = await this.projectsRepository.findOne({ where: { id: projectId, userId } });
    if (!project) {
      throw new ForbiddenException('Project not found or access denied');
    }
    
    // Check if task belongs to user
    const task = await this.tasksRepository.findOne({ where: { id: taskId, userId } });
    if (!task) {
      throw new ForbiddenException('Task not found or access denied');
    }
    
    // Assign task to project
    task.projectId = projectId;
    return this.tasksRepository.save(task);
  }
}