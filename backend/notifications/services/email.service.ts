import { Injectable, Logger } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';
import { EmailTemplateService } from './email-template.service';
import { Task } from '../../tasks/entities/task.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  async sendEmailNotification(notification: Notification, context: any = {}): Promise<boolean> {
    try {
      // In a real implementation, this would connect to an email service
      // For now, we'll just log the email that would be sent
      
      // Render email template
      const htmlContent = await this.emailTemplateService.renderTemplate('task-reminder', {
        ...context,
        taskTitle: notification.title,
        dueDate: new Date().toISOString(),
        priority: notification.priority,
      });
      
      this.logger.log(
        `Sending email notification to user ${notification.userId}: ${notification.title}`,
      );
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Update notification sent timestamp
      notification.sentAt = new Date();
      
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email notification to user ${notification.userId}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  async sendTaskReminder(task: Task, timeBefore: string): Promise<boolean> {
    try {
      // In a real implementation, this would connect to an email service
      // For now, we'll just log the email that would be sent
      
      // Render email template
      const htmlContent = await this.emailTemplateService.renderTemplate('task-reminder', {
        taskTitle: task.title,
        dueDate: task.dueDate?.toISOString() || new Date().toISOString(),
        timeBefore,
      });
      
      this.logger.log(
        `Sending email reminder for task ${task.id}: ${task.title} (${timeBefore})`,
      );
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email reminder for task ${task.id}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}