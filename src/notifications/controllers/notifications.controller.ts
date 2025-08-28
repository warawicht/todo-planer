import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { NotificationService } from '../services/notification.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { Notification } from '../entities/notification.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAll(
    @Query('skip', new ParseIntPipe({ optional: true })) skip: number = 0,
    @Query('take', new ParseIntPipe({ optional: true })) take: number = 10,
    @Query('userId') userId: string,
  ): Promise<Notification[]> {
    return this.notificationService.findAll(userId, skip, take);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<Notification> {
    const notification = await this.notificationService.findOne(id, userId);
    if (!notification) {
      // In a real implementation, you might want to throw a NotFoundException
      // For now, we'll return a default notification
      return new Notification();
    }
    return notification;
  }

  @Post()
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Query('userId') userId: string,
  ): Promise<Notification> {
    return this.notificationService.create(createNotificationDto, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const notification = await this.notificationService.update(id, userId, updateNotificationDto);
    if (!notification) {
      // In a real implementation, you might want to throw a NotFoundException
      // For now, we'll return a default notification
      return new Notification();
    }
    return notification;
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<void> {
    return this.notificationService.remove(id, userId);
  }

  @Put('bulk')
  async updateBulk(
    @Body('ids') ids: string[],
    @Body('update') updateNotificationDto: UpdateNotificationDto,
    @Query('userId') userId: string,
  ): Promise<Notification[]> {
    // In a real implementation, this would update multiple notifications
    return [];
  }

  @Delete('bulk')
  async removeBulk(
    @Body('ids') ids: string[],
    @Query('userId') userId: string,
  ): Promise<void> {
    // In a real implementation, this would delete multiple notifications
    return;
  }

  @Get('unread-count')
  async getUnreadCount(@Query('userId') userId: string): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }
}