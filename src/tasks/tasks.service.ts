import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    // Create task with user association
    const taskData = {
      ...createTaskDto,
      userId,
      status: 'pending', // Default status
    };

    const newTask = this.tasksRepository.create(taskData);
    return this.tasksRepository.save(newTask);
  }

  async findAll(userId: string, filters?: {
    status?: string;
    priority?: number;
    dueDate?: string;
    page?: number;
    limit?: number;
  }): Promise<[Task[], number]> {
    const query: FindOptionsWhere<Task> = { userId };
    
    // Apply filters if provided
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.priority !== undefined) {
      query.priority = filters.priority;
    }
    if (filters?.dueDate) {
      query.dueDate = new Date(filters.dueDate);
    }

    // Set pagination
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 10, 100); // Max 100 items per page
    const skip = (page - 1) * limit;

    return this.tasksRepository.findAndCount({
      where: query,
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
      relations: ['project', 'tags', 'timeBlocks'],
    });
  }

  async findOne(userId: string, id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id, userId },
      relations: ['project', 'tags', 'timeBlocks'],
    });
    
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    
    return task;
  }

  async update(userId: string, id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    // Check if task exists and belongs to user
    const existingTask = await this.findOne(userId, id);
    
    // Handle status transitions
    if (updateTaskDto.status && updateTaskDto.status !== existingTask.status) {
      if (!this.isValidStatusTransition(existingTask.status, updateTaskDto.status)) {
        throw new BadRequestException('Invalid status transition');
      }
      
      // Handle completedAt timestamp
      if (updateTaskDto.status === 'completed') {
        updateTaskDto.completedAt = new Date().toISOString();
      } else if (existingTask.status === 'completed') {
        updateTaskDto.completedAt = undefined;
      }
    }
    
    // Perform partial update
    await this.tasksRepository.update({ id, userId }, updateTaskDto);
    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string): Promise<void> {
    // Check if task exists and belongs to user
    await this.findOne(userId, id);
    
    // Delete task (cascade will handle time blocks)
    await this.tasksRepository.delete({ id, userId });
  }

  private isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'pending': ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      'completed': ['pending'],
      'cancelled': ['pending'],
    };
    
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  // Method to check if a task is overdue
  isTaskOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'completed') {
      return false;
    }
    
    const now = new Date();
    return task.dueDate < now;
  }

  // Method to get tasks that are due soon (within 24 hours)
  getDueSoonTasks(tasks: Task[]): Task[] {
    const now = new Date();
    const dueSoonThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    return tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') {
        return false;
      }
      
      return task.dueDate <= dueSoonThreshold && task.dueDate > now;
    });
  }
}