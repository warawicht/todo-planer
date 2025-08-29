import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditTrailModule } from '../../src/enterprise/audit-trail/audit-trail.module';
import { AuditTrail } from '../../src/enterprise/entities/audit-trail.entity';
import { User } from '../../src/users/user.entity';

describe('AuditTrailController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [AuditTrail, User],
          synchronize: true,
        }),
        AuditTrailModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get user audit trail', async () => {
    // First create a user
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    const userId = userResponse.body.user.id;

    // Then get user audit trail
    return request(app.getHttpServer())
      .get(`/users/${userId}/audit-trail`)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.auditTrails)).toBe(true);
      });
  });

  it('should get audit trail entries', () => {
    return request(app.getHttpServer())
      .get('/audit-trail')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.auditTrails)).toBe(true);
      });
  });
});