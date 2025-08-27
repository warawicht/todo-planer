import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Task Management (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

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
      .expect(201);
  });

  it('should create a new project', () => {
    return request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Test Project',
        description: 'This is a test project'
      })
      .expect(201);
  });

  it('should create a new tag', () => {
    return request(app.getHttpServer())
      .post('/tags')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'test-tag'
      })
      .expect(201);
  });
});