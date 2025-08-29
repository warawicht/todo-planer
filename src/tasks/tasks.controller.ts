import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, UsePipes, ValidationPipe, BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateSubtaskDto } from './dto/subtasks/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/subtasks/update-subtask.dto';
import { TaskAttachmentsService } from './services/task-attachments.service';
import { TaskAttachmentDto } from './dto/attachments/task-attachment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { TaskWithCollaborationDto } from './dto/task-with-collaboration.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly taskAttachmentsService: TaskAttachmentsService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.id, createTaskDto);
  }

  @Get()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async findAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('priority') priority?: number,
    @Query('dueDate') dueDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const [tasks, total] = await this.tasksService.findAllWithCollaboration(req.user.id, {
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
    return this.tasksService.findOneWithCollaboration(req.user.id, id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Request() req, @Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(req.user.id, id, updateTaskDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.tasksService.remove(req.user.id, id);
    return { message: 'Task deleted successfully' };
  }

  // Subtask endpoints
  @Post(':id/subtasks')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createSubtask(@Request() req, @Param('id') id: string, @Body() createSubtaskDto: CreateSubtaskDto) {
    return this.tasksService.createSubtask(req.user.id, id, createSubtaskDto);
  }

  @Get(':id/subtasks')
  async findSubtasks(@Request() req, @Param('id') id: string) {
    const subtasks = await this.tasksService.findSubtasks(req.user.id, id);
    // Convert to collaboration DTOs
    return subtasks.map(subtask => TaskWithCollaborationDto.fromTask(subtask, req.user.id));
  }

  @Put(':id/subtasks/:subtaskId')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateSubtask(
    @Request() req, 
    @Param('id') id: string, 
    @Param('subtaskId') subtaskId: string, 
    @Body() updateSubtaskDto: UpdateSubtaskDto
  ) {
    return this.tasksService.updateSubtask(req.user.id, id, subtaskId, updateSubtaskDto);
  }

  @Delete(':id/subtasks/:subtaskId')
  async removeSubtask(@Request() req, @Param('id') id: string, @Param('subtaskId') subtaskId: string) {
    await this.tasksService.removeSubtask(req.user.id, id, subtaskId);
    return { message: 'Subtask deleted successfully' };
  }

  @Put(':id/subtasks/:subtaskId/move')
  async reorderSubtasks(
    @Request() req, 
    @Param('id') id: string, 
    @Param('subtaskId') subtaskId: string, 
    @Body('position') position: number
  ) {
    if (position === undefined) {
      throw new BadRequestException('Position is required');
    }
    const subtasks = await this.tasksService.reorderSubtasks(req.user.id, id, subtaskId, position);
    // Convert to collaboration DTOs
    return subtasks.map(subtask => TaskWithCollaborationDto.fromTask(subtask, req.user.id));
  }

  @Post(':id/subtasks/:subtaskId/convert')
  async convertSubtaskToTask(@Request() req, @Param('id') id: string, @Param('subtaskId') subtaskId: string) {
    return this.tasksService.convertSubtaskToTask(req.user.id, id, subtaskId);
  }

  // Attachment endpoints
  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Request() req, 
    @Param('id') id: string, 
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.taskAttachmentsService.uploadFile(req.user.id, id, file);
  }

  @Get(':id/attachments')
  async listAttachments(@Request() req, @Param('id') id: string): Promise<TaskAttachmentDto[]> {
    const attachments = await this.taskAttachmentsService.findAll(req.user.id, id);
    return attachments.map(attachment => ({
      id: attachment.id,
      fileName: attachment.fileName,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      fileSize: attachment.fileSize,
      uploadedAt: attachment.uploadedAt,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt,
      taskId: attachment.taskId,
      userId: attachment.userId,
    }));
  }

  @Get(':id/attachments/:attachmentId')
  async downloadFile(
    @Request() req, 
    @Param('id') id: string, 
    @Param('attachmentId') attachmentId: string,
    @Res() res: Response
  ) {
    const { stream, filename, mimeType } = await this.taskAttachmentsService.downloadFile(
      req.user.id, 
      id, 
      attachmentId
    );
    
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    
    return stream.pipe(res);
  }

  @Delete(':id/attachments/:attachmentId')
  async removeAttachment(@Request() req, @Param('id') id: string, @Param('attachmentId') attachmentId: string) {
    await this.taskAttachmentsService.remove(req.user.id, id, attachmentId);
    return { message: 'Attachment deleted successfully' };
  }
}