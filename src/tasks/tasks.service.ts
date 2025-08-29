import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateSubtaskDto } from './dto/subtasks/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/subtasks/update-subtask.dto';
import { TaskWithCollaborationDto } from './dto/task-with-collaboration.dto';

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
      relations: ['project', 'tags', 'timeBlocks', 'subtasks', 'attachments', 'shares', 'assignments', 'comments'],
    });
  }

  async findOne(userId: string, id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id, userId },
      relations: ['project', 'tags', 'timeBlocks', 'subtasks', 'attachments', 'shares', 'assignments', 'comments'],
    });
    
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    
    return task;
  }

  async findOneWithCollaboration(userId: string, id: string): Promise<TaskWithCollaborationDto> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['project', 'tags', 'timeBlocks', 'subtasks', 'attachments', 'shares', 'assignments', 'comments'],
    });
    
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    
    return TaskWithCollaborationDto.fromTask(task, userId);
  }

  async findAllWithCollaboration(userId: string, filters?: {
    status?: string;
    priority?: number;
    dueDate?: string;
    page?: number;
    limit?: number;
  }): Promise<[TaskWithCollaborationDto[], number]> {
    const [tasks, total] = await this.findAll(userId, filters);
    const tasksWithCollaboration = tasks.map(task => TaskWithCollaborationDto.fromTask(task, userId));
    return [tasksWithCollaboration, total];
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
    
    // Delete task (cascade will handle time blocks, subtasks, and attachments)
    await this.tasksRepository.delete({ id, userId });
  }

  // Subtask methods
  async createSubtask(userId: string, parentId: string, createSubtaskDto: CreateSubtaskDto): Promise<Task> {
    // Check if parent task exists and belongs to user
    const parentTask = await this.findOne(userId, parentId);
    
    // Prevent circular references
    if (parentId === parentTask.parentId) {
      throw new BadRequestException('Cannot create subtask with circular reference');
    }
    
    // Create subtask with user and parent association
    const subtaskData = {
      ...createSubtaskDto,
      userId,
      parentId,
      status: 'pending', // Default status
    };

    const newSubtask = this.tasksRepository.create(subtaskData);
    return this.tasksRepository.save(newSubtask);
  }

  async findSubtasks(userId: string, parentId: string): Promise<Task[]> {
    // Check if parent task exists and belongs to user
    await this.findOne(userId, parentId);
    
    // Find all subtasks for the parent task
    return this.tasksRepository.find({
      where: { parentId, userId },
      order: {
        position: 'ASC',
        createdAt: 'ASC',
      },
      relations: ['project', 'tags', 'timeBlocks', 'subtasks', 'attachments', 'shares', 'assignments', 'comments'],
    });
  }

  async updateSubtask(userId: string, parentId: string, subtaskId: string, updateSubtaskDto: UpdateSubtaskDto): Promise<Task> {
    // Check if parent task exists and belongs to user
    await this.findOne(userId, parentId);
    
    // Check if subtask exists and belongs to user
    const existingSubtask = await this.tasksRepository.findOne({
      where: { id: subtaskId, parentId, userId },
      relations: ['project', 'tags', 'timeBlocks', 'subtasks', 'attachments', 'shares', 'assignments', 'comments'],
    });
    
    if (!existingSubtask) {
      throw new NotFoundException('Subtask not found');
    }
    
    // Handle status transitions
    if (updateSubtaskDto.status && updateSubtaskDto.status !== existingSubtask.status) {
      if (!this.isValidStatusTransition(existingSubtask.status, updateSubtaskDto.status)) {
        throw new BadRequestException('Invalid status transition');
      }
      
      // Handle completedAt timestamp
      if (updateSubtaskDto.status === 'completed') {
        updateSubtaskDto.completedAt = new Date().toISOString();
      } else if (existingSubtask.status === 'completed') {
        updateSubtaskDto.completedAt = undefined;
      }
    }
    
    // Perform partial update
    await this.tasksRepository.update({ id: subtaskId, parentId, userId }, updateSubtaskDto);
    const updatedSubtask = await this.tasksRepository.findOne({
      where: { id: subtaskId, parentId, userId },
      relations: ['project', 'tags', 'timeBlocks', 'subtasks', 'attachments', 'shares', 'assignments', 'comments'],
    });
    
    if (!updatedSubtask) {
      throw new NotFoundException('Subtask not found after update');
    }
    
    return updatedSubtask;
  }

  async removeSubtask(userId: string, parentId: string, subtaskId: string): Promise<void> {
    // Check if parent task exists and belongs to user
    await this.findOne(userId, parentId);
    
    // Check if subtask exists and belongs to user
    const existingSubtask = await this.tasksRepository.findOne({
      where: { id: subtaskId, parentId, userId },
    });
    
    if (!existingSubtask) {
      throw new NotFoundException('Subtask not found');
    }
    
    // Delete subtask
    await this.tasksRepository.delete({ id: subtaskId, parentId, userId });
  }

  async reorderSubtasks(userId: string, parentId: string, subtaskId: string, newPosition: number): Promise<Task[]> {
    // Check if parent task exists and belongs to user
    await this.findOne(userId, parentId);
    
    // Get all subtasks for the parent
    const subtasks = await this.tasksRepository.find({
      where: { parentId, userId },
      order: {
        position: 'ASC',
        createdAt: 'ASC',
      },
    });
    
    // Find the subtask to move
    const subtaskToMove = subtasks.find(task => task.id === subtaskId);
    if (!subtaskToMove) {
      throw new NotFoundException('Subtask not found');
    }
    
    // Remove the subtask from its current position
    const currentIndex = subtasks.findIndex(task => task.id === subtaskId);
    subtasks.splice(currentIndex, 1);
    
    // Insert the subtask at the new position
    subtasks.splice(newPosition, 0, subtaskToMove);
    
    // Update positions for all subtasks
    for (let i = 0; i < subtasks.length; i++) {
      subtasks[i].position = i;
      await this.tasksRepository.update({ id: subtasks[i].id, userId }, { position: i });
    }
    
    return this.tasksRepository.find({
      where: { parentId, userId },
      order: {
        position: 'ASC',
        createdAt: 'ASC',
      },
      relations: ['project', 'tags', 'timeBlocks', 'subtasks', 'attachments', 'shares', 'assignments', 'comments'],
    });
  }

  async convertSubtaskToTask(userId: string, parentId: string, subtaskId: string): Promise<Task> {
    // Check if parent task exists and belongs to user
    await this.findOne(userId, parentId);
    
    // Check if subtask exists and belongs to user
    const existingSubtask = await this.tasksRepository.findOne({
      where: { id: subtaskId, parentId, userId },
    });
    
    if (!existingSubtask) {
      throw new NotFoundException('Subtask not found');
    }
    
    // Convert subtask to regular task by removing parent relationship
    await this.tasksRepository.update({ id: subtaskId, userId }, { parentId: undefined, position: undefined });
    
    const convertedTask = await this.tasksRepository.findOne({
      where: { id: subtaskId, userId },
      relations: ['project', 'tags', 'timeBlocks', 'subtasks', 'attachments', 'shares', 'assignments', 'comments'],
    });
    
    if (!convertedTask) {
      throw new NotFoundException('Task not found after conversion');
    }
    
    return convertedTask;
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