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
  HttpCode,
} from '@nestjs/common';
import { CommentService } from '../services/comment.service';
import { CreateTaskCommentDto } from '../dto/create-task-comment.dto';
import { UpdateTaskCommentDto } from '../dto/update-task-comment.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { TaskComment } from '../entities/task-comment.entity';

@Controller('api/tasks')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':taskId/comments')
  async addComment(
    @Param('taskId') taskId: string,
    @Request() req,
    @Body() createTaskCommentDto: CreateTaskCommentDto,
  ): Promise<TaskComment> {
    return this.commentService.addComment(taskId, req.user.id, createTaskCommentDto);
  }

  @Get(':taskId/comments')
  async getCommentsForTask(
    @Param('taskId') taskId: string,
  ): Promise<{ data: TaskComment[]; total: number; page: number; limit: number }> {
    return this.commentService.getCommentsForTask(taskId);
  }

  @Put('comments/:commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @Request() req,
    @Body() updateTaskCommentDto: UpdateTaskCommentDto,
  ): Promise<TaskComment> {
    return this.commentService.updateComment(commentId, req.user.id, updateTaskCommentDto);
  }

  @Delete('comments/:commentId')
  @HttpCode(204)
  async deleteComment(
    @Param('commentId') commentId: string,
    @Request() req,
  ): Promise<void> {
    return this.commentService.deleteComment(commentId, req.user.id);
  }
}