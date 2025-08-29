import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  HttpCode,
} from '@nestjs/common';
import { TaskSharingService } from '../services/task-sharing.service';
import { CreateTaskShareDto } from '../dto/create-task-share.dto';
import { UpdateTaskShareDto } from '../dto/update-task-share.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { TaskShare } from '../entities/task-share.entity';

@Controller('api/tasks')
@UseGuards(JwtAuthGuard)
export class TaskSharingController {
  constructor(private readonly taskSharingService: TaskSharingService) {}

  @Post(':taskId/share')
  async shareTask(
    @Param('taskId') taskId: string,
    @Request() req,
    @Body() createTaskShareDto: CreateTaskShareDto,
  ): Promise<TaskShare> {
    return this.taskSharingService.shareTask(taskId, req.user.id, createTaskShareDto);
  }

  @Get('shared')
  async getSharedTasks(
    @Request() req,
    @Query('permissionLevel') permissionLevel?: string,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<TaskShare[]> {
    // Ensure limit is between 1 and 100
    const validatedLimit = Math.min(Math.max(limit, 1), 100);
    return this.taskSharingService.getSharedTasks(req.user.id, permissionLevel, status);
  }

  @Put('share/:shareId')
  async updateSharePermission(
    @Param('shareId') shareId: string,
    @Request() req,
    @Body() updateTaskShareDto: UpdateTaskShareDto,
  ): Promise<TaskShare> {
    return this.taskSharingService.updateSharePermission(shareId, req.user.id, updateTaskShareDto);
  }

  @Delete('share/:shareId')
  @HttpCode(204)
  async revokeTaskShare(
    @Param('shareId') shareId: string,
    @Request() req,
  ): Promise<void> {
    return this.taskSharingService.revokeTaskShare(shareId, req.user.id);
  }

  @Post('share/:shareId/accept')
  async acceptTaskShare(
    @Param('shareId') shareId: string,
    @Request() req,
  ): Promise<TaskShare> {
    return this.taskSharingService.acceptTaskShare(shareId, req.user.id);
  }
}