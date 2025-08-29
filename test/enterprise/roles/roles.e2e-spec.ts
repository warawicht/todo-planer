import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from '../../src/enterprise/roles/roles.module';
import { Role } from '../../src/enterprise/entities/role.entity';

describe('RolesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Role],
          synchronize: true,
        }),
        RolesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a role', () => {
    return request(app.getHttpServer())
      .post('/roles')
      .send({
        name: 'admin',
        description: 'Administrator role',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.role.name).toBe('admin');
        expect(res.body.role.description).toBe('Administrator role');
      });
  });

  it('should get all roles', () => {
    return request(app.getHttpServer())
      .get('/roles')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.roles)).toBe(true);
      });
  });

  it('should get a role by ID', async () => {
    // First create a role
    const createResponse = await request(app.getHttpServer())
      .post('/roles')
      .send({
        name: 'editor',
        description: 'Editor role',
      });

    const roleId = createResponse.body.role.id;

    // Then get the role by ID
    return request(app.getHttpServer())
      .get(`/roles/${roleId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.role.id).toBe(roleId);
        expect(res.body.role.name).toBe('editor');
      });
  });

  it('should update a role', async () => {
    // First create a role
    const createResponse = await request(app.getHttpServer())
      .post('/roles')
      .send({
        name: 'viewer',
        description: 'Viewer role',
      });

    const roleId = createResponse.body.role.id;

    // Then update the role
    return request(app.getHttpServer())
      .put(`/roles/${roleId}`)
      .send({
        name: 'viewer-updated',
        description: 'Updated viewer role',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.role.name).toBe('viewer-updated');
        expect(res.body.role.description).toBe('Updated viewer role');
      });
  });

  it('should delete a role', async () => {
    // First create a role
    const createResponse = await request(app.getHttpServer())
      .post('/roles')
      .send({
        name: 'temporary',
        description: 'Temporary role',
      });

    const roleId = createResponse.body.role.id;

    // Then delete the role
    await request(app.getHttpServer())
      .delete(`/roles/${roleId}`)
      .expect(200);

    // Verify the role is deleted
    return request(app.getHttpServer())
      .get(`/roles/${roleId}`)
      .expect(404);
  });
});