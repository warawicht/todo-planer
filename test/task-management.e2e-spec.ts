import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Task Management (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let taskId: string;

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

  it('should register a new user for testing', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'tasktest@example.com',
        password: 'Test123!@#Password',
        firstName: 'Task',
        lastName: 'Tester',
      })
      .expect(201);
  });

  it('should login with valid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'tasktest@example.com',
        password: 'Test123!@#Password',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
        accessToken = res.body.accessToken;
      });
  });

  it('should create a new task', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Test Task',
        description: 'This is a test task',
        priority: 1,
        status: 'pending'
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.title).toBe('Test Task');
        expect(res.body.description).toBe('This is a test task');
        expect(res.body.priority).toBe(1);
        expect(res.body.status).toBe('pending');
        taskId = res.body.id;
      });
  });

  it('should retrieve all tasks', () => {
    return request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.tasks).toBeDefined();
        expect(Array.isArray(res.body.tasks)).toBe(true);
        expect(res.body.total).toBeDefined();
        expect(res.body.page).toBeDefined();
        expect(res.body.limit).toBeDefined();
      });
  });

  it('should retrieve a specific task', () => {
    return request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(taskId);
        expect(res.body.title).toBe('Test Task');
        expect(res.body.description).toBe('This is a test task');
        expect(res.body.priority).toBe(1);
        expect(res.body.status).toBe('pending');
      });
  });

  it('should update a task', () => {
    return request(app.getHttpServer())
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated Test Task',
        priority: 2,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(taskId);
        expect(res.body.title).toBe('Updated Test Task');
        expect(res.body.description).toBe('This is a test task'); // Should remain unchanged
        expect(res.body.priority).toBe(2);
        expect(res.body.status).toBe('pending'); // Should remain unchanged
      });
  });

  it('should update task status to completed', () => {
    return request(app.getHttpServer())
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        status: 'completed',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('completed');
        expect(res.body.completedAt).toBeDefined();
      });
  });

  it('should filter tasks by status', () => {
    return request(app.getHttpServer())
      .get('/tasks?status=completed')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.tasks).toBeDefined();
        expect(Array.isArray(res.body.tasks)).toBe(true);
        // All returned tasks should have status 'completed'
        res.body.tasks.forEach(task => {
          expect(task.status).toBe('completed');
        });
      });
  });

  it('should delete a task', () => {
    return request(app.getHttpServer())
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('Task deleted successfully');
      });
  });

  it('should return 404 when trying to access deleted task', () => {
    return request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});