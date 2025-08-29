import { Injectable, BadRequestException, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskAttachment } from '../entities/attachments/task-attachment.entity';
import { Task } from '../entities/task.entity';
import { TasksService } from '../tasks.service';
import { createReadStream, promises as fsPromises } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Express } from 'express';

@Injectable()
export class TaskAttachmentsService {
  private readonly uploadDir = './uploads';

  constructor(
    @InjectRepository(TaskAttachment)
    private taskAttachmentsRepository: Repository<TaskAttachment>,
    private tasksService: TasksService,
  ) {
    // Ensure upload directory exists
    fsPromises.mkdir(this.uploadDir, { recursive: true }).catch(console.error);
  }

  async uploadFile(userId: string, taskId: string, file: Express.Multer.File): Promise<TaskAttachment> {
    // Check if task exists and belongs to user
    await this.tasksService.findOne(userId, taskId);

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Validate file type (basic validation)
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const storagePath = join(this.uploadDir, uniqueFileName);

    // Save file to disk
    try {
      await fsPromises.writeFile(storagePath, file.buffer);
    } catch (error) {
      throw new BadRequestException('Failed to save file');
    }

    // Create attachment record
    const attachment = this.taskAttachmentsRepository.create({
      fileName: uniqueFileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      storagePath,
      taskId,
      userId,
    });

    return this.taskAttachmentsRepository.save(attachment);
  }

  async findAll(userId: string, taskId: string): Promise<TaskAttachment[]> {
    // Check if task exists and belongs to user
    await this.tasksService.findOne(userId, taskId);

    return this.taskAttachmentsRepository.find({
      where: { taskId, userId },
      order: {
        uploadedAt: 'DESC',
      },
    });
  }

  async findOne(userId: string, taskId: string, attachmentId: string): Promise<TaskAttachment> {
    // Check if task exists and belongs to user
    await this.tasksService.findOne(userId, taskId);

    const attachment = await this.taskAttachmentsRepository.findOne({
      where: { id: attachmentId, taskId, userId },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return attachment;
  }

  async downloadFile(userId: string, taskId: string, attachmentId: string): Promise<{ stream: StreamableFile; filename: string; mimeType: string }> {
    // Get attachment record
    const attachment = await this.findOne(userId, taskId, attachmentId);

    // Check if file exists
    try {
      await fsPromises.access(attachment.storagePath);
    } catch (error) {
      throw new NotFoundException('File not found');
    }

    const stream = createReadStream(attachment.storagePath);
    return {
      stream: new StreamableFile(stream),
      filename: attachment.originalName,
      mimeType: attachment.mimeType,
    };
  }

  async remove(userId: string, taskId: string, attachmentId: string): Promise<void> {
    // Get attachment record
    const attachment = await this.findOne(userId, taskId, attachmentId);

    // Delete file from disk
    try {
      await fsPromises.unlink(attachment.storagePath);
    } catch (error) {
      // Log error but continue with database deletion
      console.error('Failed to delete file from disk:', error);
    }

    // Delete attachment record from database
    await this.taskAttachmentsRepository.delete({ id: attachmentId, taskId, userId });
  }

  // Utility method to clean up attachments when a task is deleted
  async cleanupAttachmentsForTask(taskId: string): Promise<void> {
    const attachments = await this.taskAttachmentsRepository.find({
      where: { taskId },
    });

    // Delete all files from disk
    for (const attachment of attachments) {
      try {
        await fsPromises.unlink(attachment.storagePath);
      } catch (error) {
        // Log error but continue with other deletions
        console.error('Failed to delete file from disk:', error);
      }
    }

    // Delete all attachment records from database
    await this.taskAttachmentsRepository.delete({ taskId });
  }
}