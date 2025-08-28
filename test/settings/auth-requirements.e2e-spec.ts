import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThemePreference } from '../../src/settings/entities/theme-preference.entity';
import { TimezonePreference } from '../../src/settings/entities/timezone-preference.entity';
import { ProfilePreference } from '../../src/settings/entities/profile-preference.entity';
import { DataExport } from '../../src/settings/entities/data-export.entity';
import { User } from '../../src/users/user.entity';
import { SettingsModule } from '../../src/settings/settings.module';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';

describe('Settings API Authentication Requirements (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, ThemePreference, TimezonePreference, ProfilePreference, DataExport],
          synchronize: true,
        }),
        AuthModule,
        UsersModule,
        SettingsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Required for All Endpoints', () => {
    const endpoints = [
      { method: 'GET', path: '/settings/theme' },
      { method: 'PUT', path: '/settings/theme' },
      { method: 'GET', path: '/settings/timezone' },
      { method: 'PUT', path: '/settings/timezone' },
      { method: 'GET', path: '/settings/profile' },
      { method: 'PUT', path: '/settings/profile' },
      { method: 'POST', path: '/settings/profile/avatar' },
      { method: 'POST', path: '/settings/export' },
    ];

    endpoints.forEach(({ method, path }) => {
      it(`should return 401 for ${method} ${path} without authentication`, () => {
        const req = request(app.getHttpServer())[method.toLowerCase()](path);
        
        if (method === 'PUT' || method === 'POST') {
          return req.send({}).expect(401);
        } else {
          return req.expect(401);
        }
      });
    });
  });

  describe('Valid Authentication Allows Access', () => {
    let authToken: string;

    beforeAll(async () => {
      // Create a test user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'auth-test@example.com',
          password: 'Password123!',
          firstName: 'Auth',
          lastName: 'Test',
        });

      // Login to get auth token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'auth-test@example.com',
          password: 'Password123!',
        });

      authToken = loginResponse.body.access_token;
    });

    it('should allow access to theme endpoint with valid authentication', () => {
      return request(app.getHttpServer())
        .get('/settings/theme')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should allow access to timezone endpoint with valid authentication', () => {
      return request(app.getHttpServer())
        .get('/settings/timezone')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should allow access to profile endpoint with valid authentication', () => {
      return request(app.getHttpServer())
        .get('/settings/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should allow access to export endpoint with valid authentication', () => {
      return request(app.getHttpServer())
        .post('/settings/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ format: 'json', dataType: 'all' })
        .expect(201);
    });
  });
});