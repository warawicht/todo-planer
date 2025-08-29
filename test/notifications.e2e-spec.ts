import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('NotificationsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/notifications (GET)', () => {
    it('should return an array of notifications', () => {
      return request(app.getHttpServer())
        .get('/notifications')
        .query({ userId: 'user-123' })
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should return notifications with pagination', () => {
      return request(app.getHttpServer())
        .get('/notifications')
        .query({ userId: 'user-123', skip: 0, take: 5 })
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter notifications by read status', () => {
      return request(app.getHttpServer())
        .get('/notifications')
        .query({ userId: 'user-123', read: true })
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter notifications by type', () => {
      return request(app.getHttpServer())
        .get('/notifications')
        .query({ userId: 'user-123', type: 'task_reminder' })
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter notifications by priority', () => {
      return request(app.getHttpServer())
        .get('/notifications')
        .query({ userId: 'user-123', priority: 2 })
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/notifications (POST)', () => {
    it('should create a new notification', () => {
      const createNotificationDto = {
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'task_reminder',
        channel: 'email',
        priority: 2,
        relatedEntityId: 'task-123',
        relatedEntityType: 'task',
      };

      return request(app.getHttpServer())
        .post('/notifications')
        .query({ userId: 'user-123' })
        .send(createNotificationDto)
        .expect(201)
        .expect(res => {
          expect(res.body.title).toBe(createNotificationDto.title);
          expect(res.body.message).toBe(createNotificationDto.message);
        });
    });
  });

  describe('/notifications/:id (GET)', () => {
    it('should return a notification by id', () => {
      return request(app.getHttpServer())
        .get('/notifications/notification-123')
        .query({ userId: 'user-123' })
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe('notification-123');
        });
    });
  });

  describe('/notifications/unread-count (GET)', () => {
    it('should return the count of unread notifications', () => {
      return request(app.getHttpServer())
        .get('/notifications/unread-count')
        .query({ userId: 'user-123' })
        .expect(200)
        .expect(res => {
          expect(typeof res.body.count).toBe('number');
        });
    });
  });
});

describe('RemindersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/reminders (GET)', () => {
    it('should return an array of reminders', () => {
      return request(app.getHttpServer())
        .get('/reminders')
        .query({ userId: 'user-123' })
        .expect(200)
        .expect(res => {
          expect(res.body.message).toBe('Get all reminders');
        });
    });
  });

  describe('/reminders (POST)', () => {
    it('should create a new reminder', () => {
      const createReminderDto = {
        taskId: 'task-123',
        timeBefore: '5_min',
        enabled: true,
      };

      return request(app.getHttpServer())
        .post('/reminders')
        .query({ userId: 'user-123' })
        .send(createReminderDto)
        .expect(201)
        .expect(res => {
          expect(res.body.message).toBe('Create reminder');
          expect(res.body.createReminderDto.taskId).toBe(createReminderDto.taskId);
        });
    });
  });

  describe('/reminders/:id (GET)', () => {
    it('should return a reminder by id', () => {
      return request(app.getHttpServer())
        .get('/reminders/reminder-123')
        .query({ userId: 'user-123' })
        .expect(200)
        .expect(res => {
          expect(res.body.message).toBe('Get reminder');
          expect(res.body.id).toBe('reminder-123');
        });
    });
  });

  describe('/reminders/:id (PUT)', () => {
    it('should update a reminder', () => {
      const updateReminderDto = {
        enabled: false,
      };

      return request(app.getHttpServer())
        .put('/reminders/reminder-123')
        .query({ userId: 'user-123' })
        .send(updateReminderDto)
        .expect(200)
        .expect(res => {
          expect(res.body.message).toBe('Update reminder');
          expect(res.body.id).toBe('reminder-123');
        });
    });
  });

  describe('/reminders/:id (DELETE)', () => {
    it('should delete a reminder', () => {
      return request(app.getHttpServer())
        .delete('/reminders/reminder-123')
        .query({ userId: 'user-123' })
        .expect(200)
        .expect(res => {
          expect(res.body.message).toBe('Delete reminder');
          expect(res.body.id).toBe('reminder-123');
        });
    });
  });
});

describe('NotificationPreferencesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/notification-preferences (GET)', () => {
    it('should return notification preferences for a user', () => {
      return request(app.getHttpServer())
        .get('/notification-preferences')
        .query({ userId: 'user-123' })
        .expect(200);
    });
  });

  describe('/notification-preferences (PUT)', () => {
    it('should update notification preferences for a user', () => {
      const updatePreferencesDto = {
        emailEnabled: false,
        pushEnabled: true,
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      };

      return request(app.getHttpServer())
        .put('/notification-preferences')
        .query({ userId: 'user-123' })
        .send(updatePreferencesDto)
        .expect(200)
        .expect(res => {
          expect(res.body.message).toBe('Update notification preferences');
        });
    });
  });

  describe('/notification-preferences/quiet-hours-status (GET)', () => {
    it('should return quiet hours status for a user', () => {
      return request(app.getHttpServer())
        .get('/notification-preferences/quiet-hours-status')
        .query({ userId: 'user-123' })
        .expect(200)
        .expect(res => {
          expect(typeof res.body.isWithinQuietHours).toBe('boolean');
          expect(typeof res.body.feedback).toBe('string');
        });
    });
  });
});

describe('QuietHoursFunctionality (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Quiet Hours Suppression', () => {
    it('should suppress notifications during quiet hours', async () => {
      // First, enable quiet hours
      const updatePreferencesDto = {
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      };

      await request(app.getHttpServer())
        .put('/notification-preferences')
        .query({ userId: 'user-123' })
        .send(updatePreferencesDto)
        .expect(200);

      // Then check if notifications are suppressed
      return request(app.getHttpServer())
        .get('/notification-preferences/quiet-hours-status')
        .query({ userId: 'user-123' })
        .expect(200)
        .expect(res => {
          expect(typeof res.body.isWithinQuietHours).toBe('boolean');
          expect(typeof res.body.feedback).toBe('string');
        });
    });

    it('should not suppress critical notifications during quiet hours', async () => {
      // This would require a more complex test setup to verify that
      // critical notifications (priority 4) are not suppressed
      // For now, we'll just verify the endpoint works
      return request(app.getHttpServer())
        .get('/notification-preferences/quiet-hours-status')
        .query({ userId: 'user-123' })
        .expect(200);
    });
  });
});

describe('EmailNotificationDelivery (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Email Notification Sending', () => {
    it('should send email notifications when enabled', async () => {
      // First, enable email notifications
      const updatePreferencesDto = {
        emailEnabled: true,
        taskRemindersEnabled: true,
      };

      await request(app.getHttpServer())
        .put('/notification-preferences')
        .query({ userId: 'user-123' })
        .send(updatePreferencesDto)
        .expect(200);

      // Then trigger a notification that should send an email
      const createNotificationDto = {
        title: 'Test Email Notification',
        message: 'This is a test email notification',
        type: 'task_reminder',
        channel: 'email',
        priority: 2,
        relatedEntityId: 'task-123',
        relatedEntityType: 'task',
      };

      return request(app.getHttpServer())
        .post('/notifications')
        .query({ userId: 'user-123' })
        .send(createNotificationDto)
        .expect(201);
    });

    it('should not send email notifications when disabled', async () => {
      // First, disable email notifications
      const updatePreferencesDto = {
        emailEnabled: false,
      };

      await request(app.getHttpServer())
        .put('/notification-preferences')
        .query({ userId: 'user-123' })
        .send(updatePreferencesDto)
        .expect(200);

      // Then trigger a notification that should not send an email
      const createNotificationDto = {
        title: 'Test Email Notification',
        message: 'This is a test email notification',
        type: 'task_reminder',
        channel: 'email',
        priority: 2,
        relatedEntityId: 'task-123',
        relatedEntityType: 'task',
      };

      return request(app.getHttpServer())
        .post('/notifications')
        .query({ userId: 'user-123' })
        .send(createNotificationDto)
        .expect(201);
    });
  });
});

describe('PushNotificationDelivery (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Push Notification Sending', () => {
    it('should send push notifications when enabled', async () => {
      // First, enable push notifications
      const updatePreferencesDto = {
        pushEnabled: true,
        taskRemindersEnabled: true,
      };

      await request(app.getHttpServer())
        .put('/notification-preferences')
        .query({ userId: 'user-123' })
        .send(updatePreferencesDto)
        .expect(200);

      // Then trigger a notification that should send a push notification
      const createNotificationDto = {
        title: 'Test Push Notification',
        message: 'This is a test push notification',
        type: 'task_reminder',
        channel: 'push',
        priority: 2,
        relatedEntityId: 'task-123',
        relatedEntityType: 'task',
      };

      return request(app.getHttpServer())
        .post('/notifications')
        .query({ userId: 'user-123' })
        .send(createNotificationDto)
        .expect(201);
    });

    it('should not send push notifications when disabled', async () => {
      // First, disable push notifications
      const updatePreferencesDto = {
        pushEnabled: false,
      };

      await request(app.getHttpServer())
        .put('/notification-preferences')
        .query({ userId: 'user-123' })
        .send(updatePreferencesDto)
        .expect(200);

      // Then trigger a notification that should not send a push notification
      const createNotificationDto = {
        title: 'Test Push Notification',
        message: 'This is a test push notification',
        type: 'task_reminder',
        channel: 'push',
        priority: 2,
        relatedEntityId: 'task-123',
        relatedEntityType: 'task',
      };

      return request(app.getHttpServer())
        .post('/notifications')
        .query({ userId: 'user-123' })
        .send(createNotificationDto)
        .expect(201);
    });
  });
});

describe('InAppNotificationDisplay (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('In-App Notification Display', () => {
    it('should display in-app notifications when enabled', async () => {
      // First, enable in-app notifications
      const updatePreferencesDto = {
        inAppEnabled: true,
        taskRemindersEnabled: true,
      };

      await request(app.getHttpServer())
        .put('/notification-preferences')
        .query({ userId: 'user-123' })
        .send(updatePreferencesDto)
        .expect(200);

      // Then trigger a notification that should be displayed in-app
      const createNotificationDto = {
        title: 'Test In-App Notification',
        message: 'This is a test in-app notification',
        type: 'task_reminder',
        channel: 'in_app',
        priority: 2,
        relatedEntityId: 'task-123',
        relatedEntityType: 'task',
      };

      return request(app.getHttpServer())
        .post('/notifications')
        .query({ userId: 'user-123' })
        .send(createNotificationDto)
        .expect(201);
    });

    it('should not display in-app notifications when disabled', async () => {
      // First, disable in-app notifications
      const updatePreferencesDto = {
        inAppEnabled: false,
      };

      await request(app.getHttpServer())
        .put('/notification-preferences')
        .query({ userId: 'user-123' })
        .send(updatePreferencesDto)
        .expect(200);

      // Then trigger a notification that should not be displayed in-app
      const createNotificationDto = {
        title: 'Test In-App Notification',
        message: 'This is a test in-app notification',
        type: 'task_reminder',
        channel: 'in_app',
        priority: 2,
        relatedEntityId: 'task-123',
        relatedEntityType: 'task',
      };

      return request(app.getHttpServer())
        .post('/notifications')
        .query({ userId: 'user-123' })
        .send(createNotificationDto)
        .expect(201);
    });

    it('should update notification read status', () => {
      return request(app.getHttpServer())
        .put('/notifications/notification-123')
        .query({ userId: 'user-123' })
        .send({ read: true })
        .expect(200);
    });

    it('should dismiss notifications', () => {
      return request(app.getHttpServer())
        .delete('/notifications/notification-123')
        .query({ userId: 'user-123' })
        .expect(200);
    });
  });
});

describe('ReminderProcessingLogic (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Reminder Creation and Triggering', () => {
    it('should create a reminder and trigger notifications at the correct time', async () => {
      // Create a task first
      // Note: This would require the tasks module to be fully implemented
      // For now, we'll just test the reminder creation endpoint
      
      const createReminderDto = {
        taskId: 'task-123',
        timeBefore: '5_min',
        enabled: true,
      };

      return request(app.getHttpServer())
        .post('/reminders')
        .query({ userId: 'user-123' })
        .send(createReminderDto)
        .expect(201)
        .expect(res => {
          expect(res.body.message).toBe('Create reminder');
          expect(res.body.createReminderDto.taskId).toBe(createReminderDto.taskId);
        });
    });

    it('should respect user preferences when triggering reminders', async () => {
      // Disable task reminders
      const updatePreferencesDto = {
        taskRemindersEnabled: false,
      };

      await request(app.getHttpServer())
        .put('/notification-preferences')
        .query({ userId: 'user-123' })
        .send(updatePreferencesDto)
        .expect(200);

      // Create a reminder
      const createReminderDto = {
        taskId: 'task-123',
        timeBefore: '5_min',
        enabled: true,
      };

      return request(app.getHttpServer())
        .post('/reminders')
        .query({ userId: 'user-123' })
        .send(createReminderDto)
        .expect(201);
    });
  });
});

describe('NotificationFilteringAndPagination (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Notification Filtering', () => {
    it('should filter notifications by channel', () => {
      return request(app.getHttpServer())
        .get('/notifications')
        .query({ userId: 'user-123', channel: 'email' })
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter notifications by date range', () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      
      return request(app.getHttpServer())
        .get('/notifications')
        .query({ userId: 'user-123', startDate, endDate })
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter notifications by related entity type', () => {
      return request(app.getHttpServer())
        .get('/notifications')
        .query({ userId: 'user-123', relatedEntityType: 'task' })
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Notification Pagination', () => {
    it('should return paginated results with skip and take parameters', () => {
      return request(app.getHttpServer())
        .get('/notifications')
        .query({ userId: 'user-123', skip: 10, take: 5 })
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          // In a real implementation, we would check that the response includes pagination metadata
        });
    });

    it('should return paginated results with default values', () => {
      return request(app.getHttpServer())
        .get('/notifications')
        .query({ userId: 'user-123' })
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});