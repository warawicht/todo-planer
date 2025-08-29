import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AI Scheduling Controller (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Scheduling Suggestions', () => {
    it('should get scheduling suggestions for a user', () => {
      return request(app.getHttpServer())
        .get('/ai/suggestions/scheduling?userId=test-user-id')
        .expect(200);
    });

    it('should apply a scheduling suggestion', () => {
      return request(app.getHttpServer())
        .post('/ai/suggestions/scheduling/test-suggestion-id/apply')
        .send({ userId: 'test-user-id' })
        .expect(201);
    });

    it('should dismiss a suggestion', () => {
      return request(app.getHttpServer())
        .post('/ai/suggestions/test-suggestion-id/dismiss')
        .send({ userId: 'test-user-id' })
        .expect(201);
    });
  });

  describe('Productivity Patterns', () => {
    it('should get productivity patterns for a user', () => {
      return request(app.getHttpServer())
        .get('/ai/patterns?userId=test-user-id')
        .expect(200);
    });

    it('should refresh productivity patterns', () => {
      return request(app.getHttpServer())
        .post('/ai/patterns/refresh')
        .send({ userId: 'test-user-id' })
        .expect(201);
    });
  });

  describe('Task Prioritization', () => {
    it('should get task prioritization recommendations', () => {
      return request(app.getHttpServer())
        .get('/ai/prioritization?userId=test-user-id')
        .expect(200);
    });

    it('should apply a task prioritization recommendation', () => {
      return request(app.getHttpServer())
        .post('/ai/prioritization/test-task-id/apply')
        .send({ userId: 'test-user-id' })
        .expect(201);
    });
  });

  describe('NLP Task Creation', () => {
    it('should create a task using NLP', () => {
      return request(app.getHttpServer())
        .post('/ai/nlp/tasks')
        .send({ userId: 'test-user-id', text: 'Create a report by Friday' })
        .expect(201);
    });

    it('should review an NLP-processed task', () => {
      return request(app.getHttpServer())
        .post('/ai/nlp/tasks/test-task-id/review')
        .send({ userId: 'test-user-id', title: 'Updated Task Title' })
        .expect(201);
    });
  });
});