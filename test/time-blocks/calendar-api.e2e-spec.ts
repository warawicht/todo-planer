import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeBlocksModule } from '../../src/time-blocks/time-blocks.module';
import { UsersModule } from '../../src/users/users.module';
import { AuthModule } from '../../src/auth/auth.module';
import { TimeBlock } from '../../src/time-blocks/entities/time-block.entity';
import { User } from '../../src/users/user.entity';
import { RefreshToken } from '../../src/auth/refresh-token.entity';
import { Task } from '../../src/tasks/entities/task.entity';
import { TaskAttachment } from '../../src/tasks/entities/attachments/task-attachment.entity';
import { Project } from '../../src/projects/entities/project.entity';
import { Tag } from '../../src/tags/entities/tag.entity';
import { CalendarViewPreference } from '../../src/users/entities/calendar-view-preference.entity';

describe('Calendar API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            User,
            RefreshToken,
            Task,
            TaskAttachment,
            Project,
            Tag,
            TimeBlock,
            CalendarViewPreference,
          ],
          synchronize: true,
        }),
        AuthModule,
        UsersModule,
        TimeBlocksModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create a test user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(201);

    userId = registerResponse.body.id;

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(200);

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Calendar Views', () => {
    beforeEach(async () => {
      // Create some test time blocks
      await request(app.getHttpServer())
        .post('/time-blocks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Morning Meeting',
          startTime: '2023-06-15T09:00:00Z',
          endTime: '2023-06-15T10:00:00Z',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/time-blocks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Lunch Break',
          startTime: '2023-06-15T12:00:00Z',
          endTime: '2023-06-15T13:00:00Z',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/time-blocks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Afternoon Meeting',
          startTime: '2023-06-15T14:00:00Z',
          endTime: '2023-06-15T15:00:00Z',
        })
        .expect(201);
    });

    it('should get day view calendar data', async () => {
      const response = await request(app.getHttpServer())
        .get('/time-blocks/calendar')
        .query({
          view: 'day',
          date: '2023-06-15',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('view', 'day');
      expect(response.body).toHaveProperty('referenceDate');
      expect(response.body).toHaveProperty('startDate');
      expect(response.body).toHaveProperty('endDate');
      expect(response.body).toHaveProperty('timeBlocks');
      expect(response.body.timeBlocks).toHaveLength(3);
    });

    it('should get week view calendar data', async () => {
      const response = await request(app.getHttpServer())
        .get('/time-blocks/calendar')
        .query({
          view: 'week',
          date: '2023-06-15',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('view', 'week');
      expect(response.body).toHaveProperty('referenceDate');
      expect(response.body).toHaveProperty('startDate');
      expect(response.body).toHaveProperty('endDate');
      expect(response.body).toHaveProperty('timeBlocks');
      expect(response.body.timeBlocks).toHaveLength(3);
    });

    it('should get month view calendar data', async () => {
      const response = await request(app.getHttpServer())
        .get('/time-blocks/calendar')
        .query({
          view: 'month',
          date: '2023-06-15',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('view', 'month');
      expect(response.body).toHaveProperty('referenceDate');
      expect(response.body).toHaveProperty('startDate');
      expect(response.body).toHaveProperty('endDate');
      expect(response.body).toHaveProperty('timeBlocks');
      expect(response.body.timeBlocks).toHaveLength(3);
    });

    it('should return 400 for invalid view type', async () => {
      await request(app.getHttpServer())
        .get('/time-blocks/calendar')
        .query({
          view: 'invalid',
          date: '2023-06-15',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 400 for invalid date', async () => {
      await request(app.getHttpServer())
        .get('/time-blocks/calendar')
        .query({
          view: 'day',
          date: 'invalid-date',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });
});