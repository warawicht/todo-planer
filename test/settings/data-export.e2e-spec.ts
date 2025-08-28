import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataExport } from '../../src/settings/entities/data-export.entity';
import { User } from '../../src/users/user.entity';
import { SettingsModule } from '../../src/settings/settings.module';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';
import { TasksModule } from '../../src/tasks/tasks.module';
import { ProjectsModule } from '../../src/projects/projects.module';
import { TimeBlocksModule } from '../../src/time-blocks/time-blocks.module';
import { Task } from '../../src/tasks/entities/task.entity';
import { Project } from '../../src/projects/entities/project.entity';
import { TimeBlock } from '../../src/time-blocks/entities/time-block.entity';

describe('DataExportController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let exportId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, DataExport, Task, Project, TimeBlock],
          synchronize: true,
        }),
        AuthModule,
        UsersModule,
        TasksModule,
        ProjectsModule,
        TimeBlocksModule,
        SettingsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create a test user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test4@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });

    userId = registerResponse.body.user.id;
    
    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test4@example.com',
        password: 'Password123!',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/settings/export (POST)', () => {
    it('should create a data export request', async () => {
      const exportData = {
        format: 'json',
        dataType: 'all',
      };

      return request(app.getHttpServer())
        .post('/settings/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exportData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.format).toEqual('json');
          expect(res.body.dataType).toEqual('all');
          expect(res.body.status).toEqual('pending');
          exportId = res.body.id;
        });
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .post('/settings/export')
        .send({ format: 'json', dataType: 'all' })
        .expect(401);
    });

    it('should return 400 for invalid format', () => {
      return request(app.getHttpServer())
        .post('/settings/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ format: 'invalid', dataType: 'all' })
        .expect(400);
    });
  });

  describe('/settings/export/:id (GET)', () => {
    it('should get data export status', async () => {
      // First create an export to test with
      const createResponse = await request(app.getHttpServer())
        .post('/settings/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ format: 'csv', dataType: 'tasks' });

      const testExportId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/settings/export/${testExportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual(testExportId);
          expect(res.body.format).toEqual('csv');
          expect(res.body.dataType).toEqual('tasks');
          expect(res.body.status).toEqual('pending');
        });
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .get('/settings/export/123')
        .expect(401);
    });

    it('should return 404 for non-existent export', () => {
      return request(app.getHttpServer())
        .get('/settings/export/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/settings/export/:id/download (GET)', () => {
    it('should handle download request for pending export', async () => {
      // First create an export to test with
      const createResponse = await request(app.getHttpServer())
        .post('/settings/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ format: 'pdf', dataType: 'projects' });

      const testExportId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/settings/export/${testExportId}/download`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400); // Should fail because export is pending
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .get('/settings/export/123/download')
        .expect(401);
    });
  });
});