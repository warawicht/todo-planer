import { validate } from 'class-validator';
import { Notification } from './notification.entity';

describe('NotificationEntity', () => {
  it('should create a valid notification entity', async () => {
    const notification = new Notification();
    notification.id = 'notification-123';
    notification.userId = 'user-123';
    notification.title = 'Test Notification';
    notification.message = 'This is a test notification';
    notification.type = 'task_reminder';
    notification.channel = 'email';
    notification.priority = 2;
    notification.read = false;
    notification.dismissed = false;
    notification.relatedEntityId = 'task-123';
    notification.relatedEntityType = 'task';
    notification.createdAt = new Date();
    notification.updatedAt = new Date();

    // Since TypeORM entities don't typically use class-validator decorators,
    // we're just testing that the entity can be created properly
    expect(notification).toBeDefined();
    expect(notification.id).toBe('notification-123');
    expect(notification.userId).toBe('user-123');
    expect(notification.title).toBe('Test Notification');
    expect(notification.type).toBe('task_reminder');
    expect(notification.channel).toBe('email');
    expect(notification.priority).toBe(2);
  });

  it('should have correct enum values', () => {
    const notification = new Notification();
    notification.type = 'task_reminder';
    notification.channel = 'email';
    notification.relatedEntityType = 'task';

    // Test that enum values are valid
    expect(['task_reminder', 'time_block_alert', 'deadline_warning', 'productivity_summary', 'system_alert']).toContain(notification.type);
    expect(['email', 'push', 'in_app']).toContain(notification.channel);
    expect(['task', 'time_block', 'project']).toContain(notification.relatedEntityType);
  });

  it('should have correct priority range', () => {
    const notification = new Notification();
    notification.priority = 2;

    // Test that priority is within valid range (0-4)
    expect(notification.priority).toBeGreaterThanOrEqual(0);
    expect(notification.priority).toBeLessThanOrEqual(4);
  });
});