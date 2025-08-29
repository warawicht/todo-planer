import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  HttpCode,
} from '@nestjs/common';
import { TaskAssignmentService } from '../services/task-assignment.service';
import { CreateTaskAssignmentDto } from '../dto/create-task-assignment.dto';
import { UpdateTaskAssignmentStatusDto } from '../dto/update-task-assignment-status.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { TaskAssignment } from '../entities/task-assignment.entity';

@Controller('api/tasks')
@UseGuards(JwtAuthGuard)
export class TaskAssignmentController {
  constructor(private readonly taskAssignmentService: TaskAssignmentService) {}

  @Post(':taskId/assign')
  async assignTask(
    @Param('taskId') taskId: string,
    @Request() req,
    @Body() createTaskAssignmentDto: CreateTaskAssignmentDto,
  ): Promise<TaskAssignment> {
    return this.taskAssignmentService.assignTask(taskId, req.user.id, createTaskAssignmentDto);
  }

  @Get('assigned')
  async getAssignedTasks(
    @Request() req,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: TaskAssignment[]; total: number; page: number; limit: number }> {
    // Ensure limit is between 1 and 100
    const validatedLimit = Math.min(Math.max(limit, 1), 100);
    return this.taskAssignmentService.getAssignedTasks(req.user.id, status);
  }

  @Put('assignment/:assignmentId/status')
  async updateAssignmentStatus(
    @Param('assignmentId') assignmentId: string,
    @Request() req,
    @Body() updateTaskAssignmentStatusDto: UpdateTaskAssignmentStatusDto,
  ): Promise<TaskAssignment> {
    return this.taskAssignmentService.updateAssignmentStatus(assignmentId, req.user.id, updateTaskAssignmentStatusDto);
  }
}