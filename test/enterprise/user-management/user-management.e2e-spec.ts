import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserManagementModule } from '../../backend/enterprise/user-management/user-management.module';
import { User } from '../../backend/users/user.entity';
import { Role } from '../../backend/enterprise/entities/role.entity';
import { UserRole } from '../../backend/enterprise/entities/user-role.entity';

describe('UserManagementController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Role, UserRole],
          synchronize: true,
        }),
        UserManagementModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get all users', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.users)).toBe(true);
      });
  });

  it('should get user roles', async () => {
    // First create a user
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    const userId = userResponse.body.user.id;

    // Then get user roles
    return request(app.getHttpServer())
      .get(`/users/${userId}/roles`)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.roles)).toBe(true);
      });
  });

  it('should update user status', async () => {
    // First create a user
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'test2@example.com',
        password: 'password123',
      });

    const userId = userResponse.body.user.id;

    // Then update user status
    return request(app.getHttpServer())
      .put(`/users/${userId}/status`)
      .send({
        isActive: false,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.user.isActive).toBe(false);
      });
  });
});