import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from '../../src/enterprise/permissions/permissions.module';
import { Permission } from '../../src/enterprise/entities/permission.entity';
import { RolePermission } from '../../src/enterprise/entities/role-permission.entity';

describe('PermissionsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Permission, RolePermission],
          synchronize: true,
        }),
        PermissionsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a permission', () => {
    return request(app.getHttpServer())
      .post('/permissions')
      .send({
        name: 'task:create',
        description: 'Create tasks',
        resource: 'task',
        action: 'create',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.permission.name).toBe('task:create');
        expect(res.body.permission.resource).toBe('task');
        expect(res.body.permission.action).toBe('create');
      });
  });

  it('should get all permissions', () => {
    return request(app.getHttpServer())
      .get('/permissions')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.permissions)).toBe(true);
      });
  });

  it('should get a permission by ID', async () => {
    // First create a permission
    const createResponse = await request(app.getHttpServer())
      .post('/permissions')
      .send({
        name: 'task:edit',
        description: 'Edit tasks',
        resource: 'task',
        action: 'edit',
      });

    const permissionId = createResponse.body.permission.id;

    // Then get the permission by ID
    return request(app.getHttpServer())
      .get(`/permissions/${permissionId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.permission.id).toBe(permissionId);
        expect(res.body.permission.name).toBe('task:edit');
      });
  });

  it('should update a permission', async () => {
    // First create a permission
    const createResponse = await request(app.getHttpServer())
      .post('/permissions')
      .send({
        name: 'task:view',
        description: 'View tasks',
        resource: 'task',
        action: 'view',
      });

    const permissionId = createResponse.body.permission.id;

    // Then update the permission
    return request(app.getHttpServer())
      .put(`/permissions/${permissionId}`)
      .send({
        name: 'task:view-updated',
        description: 'Updated view tasks permission',
        resource: 'task',
        action: 'view',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.permission.name).toBe('task:view-updated');
        expect(res.body.permission.description).toBe('Updated view tasks permission');
      });
  });

  it('should delete a permission', async () => {
    // First create a permission
    const createResponse = await request(app.getHttpServer())
      .post('/permissions')
      .send({
        name: 'task:delete',
        description: 'Delete tasks',
        resource: 'task',
        action: 'delete',
      });

    const permissionId = createResponse.body.permission.id;

    // Then delete the permission
    await request(app.getHttpServer())
      .delete(`/permissions/${permissionId}`)
      .expect(200);

    // Verify the permission is deleted
    return request(app.getHttpServer())
      .get(`/permissions/${permissionId}`)
      .expect(404);
  });
});