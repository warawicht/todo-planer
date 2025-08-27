import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.id, createTaskDto);
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('priority') priority?: number,
    @Query('dueDate') dueDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const [tasks, total] = await this.tasksService.findAll(req.user.id, {
      status,
      priority: priority !== undefined ? Number(priority) : undefined,
      dueDate,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    
    return {
      tasks,
      total,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    };
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.tasksService.findOne(req.user.id, id);
  }

  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(req.user.id, id, updateTaskDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.tasksService.remove(req.user.id, id);
    return { message: 'Task deleted successfully' };
  }
}