import { validate } from 'class-validator';
import { CreateNotificationDto } from './create-notification.dto';

describe('CreateNotificationDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = new CreateNotificationDto();
    dto.title = 'Test Notification';
    dto.message = 'This is a test notification';
    dto.type = 'task_reminder';
    dto.channel = 'email';
    dto.priority = 2;
    dto.relatedEntityId = 'task-123';
    dto.relatedEntityType = 'task';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid type', async () => {
    const dto = new CreateNotificationDto();
    dto.title = 'Test Notification';
    dto.message = 'This is a test notification';
    dto.type = 'invalid_type' as any;
    dto.channel = 'email';
    dto.priority = 2;
    dto.relatedEntityId = 'task-123';
    dto.relatedEntityType = 'task';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('type');
  });

  it('should fail validation with invalid priority', async () => {
    const dto = new CreateNotificationDto();
    dto.title = 'Test Notification';
    dto.message = 'This is a test notification';
    dto.type = 'task_reminder';
    dto.channel = 'email';
    dto.priority = 5; // Invalid priority (should be 0-4)
    dto.relatedEntityId = 'task-123';
    dto.relatedEntityType = 'task';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('priority');
  });

  it('should fail validation with missing title', async () => {
    const dto = new CreateNotificationDto();
    // title is missing
    dto.message = 'This is a test notification';
    dto.type = 'task_reminder';
    dto.channel = 'email';
    dto.priority = 2;
    dto.relatedEntityId = 'task-123';
    dto.relatedEntityType = 'task';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});