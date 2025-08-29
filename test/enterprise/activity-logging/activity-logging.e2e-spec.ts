import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLoggingModule } from '../../src/enterprise/activity-logging/activity-logging.module';
import { ActivityLog } from '../../src/enterprise/entities/activity-log.entity';
import { User } from '../../src/users/user.entity';

describe('ActivityLoggingController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [ActivityLog, User],
          synchronize: true,
        }),
        ActivityLoggingModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get user activity logs', async () => {
    // First create a user
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    const userId = userResponse.body.user.id;

    // Then get user activity logs
    return request(app.getHttpServer())
      .get(`/users/${userId}/activity-logs`)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.logs)).toBe(true);
      });
  });

  it('should get system activity logs', () => {
    return request(app.getHttpServer())
      .get('/activity-logs')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.logs)).toBe(true);
      });
  });
});