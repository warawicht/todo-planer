import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimezonePreference } from '../../src/settings/entities/timezone-preference.entity';
import { User } from '../../src/users/user.entity';
import { SettingsModule } from '../../src/settings/settings.module';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';

describe('TimezonePreferenceController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, TimezonePreference],
          synchronize: true,
        }),
        AuthModule,
        UsersModule,
        SettingsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create a test user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test2@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });

    userId = registerResponse.body.user.id;
    
    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test2@example.com',
        password: 'Password123!',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/settings/timezone (GET)', () => {
    it('should get timezone preferences', async () => {
      return request(app.getHttpServer())
        .get('/settings/timezone')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('timezone');
          expect(res.body).toHaveProperty('autoDetect');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .get('/settings/timezone')
        .expect(401);
    });
  });

  describe('/settings/timezone (PUT)', () => {
    it('should update timezone preferences', async () => {
      const updateData = {
        timezone: 'America/New_York',
        autoDetect: false,
      };

      return request(app.getHttpServer())
        .put('/settings/timezone')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.timezone).toEqual('America/New_York');
          expect(res.body.autoDetect).toEqual(false);
        });
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .put('/settings/timezone')
        .send({ timezone: 'America/New_York' })
        .expect(401);
    });

    it('should return 400 for invalid timezone value', () => {
      return request(app.getHttpServer())
        .put('/settings/timezone')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ timezone: 'invalid/timezone' })
        .expect(400);
    });
  });
});