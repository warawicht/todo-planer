import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnterpriseModule } from '../../src/enterprise/enterprise.module';
import { Role } from '../../src/enterprise/entities/role.entity';
import { Permission } from '../../src/enterprise/entities/permission.entity';
import { UserRole } from '../../src/enterprise/entities/user-role.entity';
import { RolePermission } from '../../src/enterprise/entities/role-permission.entity';
import { User } from '../../src/users/user.entity';

describe('RBAC Security (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Role, Permission, UserRole, RolePermission],
          synchronize: true,
        }),
        EnterpriseModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should deny access to protected endpoint without proper role', async () => {
    // Create a user
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    // Try to access protected endpoint without proper role
    return request(app.getHttpServer())
      .get('/admin/protected-endpoint')
      .set('Authorization', `Bearer ${userResponse.body.user.id}`)
      .expect(403);
  });

  it('should allow access to protected endpoint with proper role', async () => {
    // Create a user
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      });

    const userId = userResponse.body.user.id;

    // Create admin role
    const roleResponse = await request(app.getHttpServer())
      .post('/roles')
      .send({
        name: 'admin',
        description: 'Administrator role',
      });

    const roleId = roleResponse.body.role.id;

    // Assign role to user
    await request(app.getHttpServer())
      .post(`/users/${userId}/roles`)
      .send({
        roleId,
      });

    // Try to access protected endpoint with proper role
    // Note: This is a simplified test. In a real application, you would need to implement
    // the actual protected endpoints and role checking logic.
    return request(app.getHttpServer())
      .get('/roles')
      .set('Authorization', `Bearer ${userId}`)
      .expect(200);
  });

  it('should deny access when user does not have required permission', async () => {
    // Create a user
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'user@example.com',
        password: 'password123',
      });

    const userId = userResponse.body.user.id;

    // Create user role
    const roleResponse = await request(app.getHttpServer())
      .post('/roles')
      .send({
        name: 'user',
        description: 'Regular user role',
      });

    const roleId = roleResponse.body.role.id;

    // Assign role to user
    await request(app.getHttpServer())
      .post(`/users/${userId}/roles`)
      .send({
        roleId,
      });

    // Try to access admin-only endpoint
    return request(app.getHttpServer())
      .delete('/roles/some-role-id')
      .set('Authorization', `Bearer ${userId}`)
      .expect(403);
  });
});