import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { QuietHoursService } from './quiet-hours.service';
import { NotificationPreferenceService } from './notification-preference.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private readonly quietHoursService: QuietHoursService,
    private readonly notificationPreferenceService: NotificationPreferenceService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto, userId: string): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      userId,
    });
    return this.notificationRepository.save(notification);
  }

  async findAll(userId: string, skip: number = 0, take: number = 10): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Notification | null> {
    return this.notificationRepository.findOne({
      where: { id, userId },
    });
  }

  async update(id: string, userId: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    await this.notificationRepository.update({ id, userId }, updateNotificationDto);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.notificationRepository.delete({ id, userId });
  }

  async markAsRead(id: string, userId: string): Promise<Notification | null> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    
    if (notification && !notification.read) {
      notification.read = true;
      notification.readAt = new Date();
      return this.notificationRepository.save(notification);
    }
    
    return notification;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, read: false },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );
  }

  async isWithinQuietHours(userId: string): Promise<boolean> {
    const preferences = await this.notificationPreferenceService.findOne(userId);
    return this.quietHoursService.isWithinQuietHours(preferences);
  }
}