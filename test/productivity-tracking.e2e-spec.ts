import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ProductivityTrackingModule } from '../backend/productivity-tracking/productivity-tracking.module';

describe('ProductivityTrackingController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProductivityTrackingModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/productivity/statistics (GET)', () => {
    return request(app.getHttpServer())
      .get('/productivity/statistics')
      .expect(400); // Should fail without required query parameters
  });

  it('/productivity/time-entries (POST)', () => {
    return request(app.getHttpServer())
      .post('/productivity/time-entries')
      .expect(400); // Should fail without required body
  });

  it('/productivity/dashboard (GET)', () => {
    return request(app.getHttpServer())
      .get('/productivity/dashboard')
      .expect(400); // Should fail without required query parameters
  });

  afterEach(async () => {
    await app.close();
  });
});