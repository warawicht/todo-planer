import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThemePreference } from '../../src/settings/entities/theme-preference.entity';
import { User } from '../../src/users/user.entity';
import { SettingsModule } from '../../src/settings/settings.module';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';

describe('ThemePreferenceController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, ThemePreference],
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
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });

    userId = registerResponse.body.user.id;
    
    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/settings/theme (GET)', () => {
    it('should get theme preferences', async () => {
      return request(app.getHttpServer())
        .get('/settings/theme')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('theme');
          expect(res.body).toHaveProperty('accentColor');
          expect(res.body).toHaveProperty('highContrastMode');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .get('/settings/theme')
        .expect(401);
    });
  });

  describe('/settings/theme (PUT)', () => {
    it('should update theme preferences', async () => {
      const updateData = {
        theme: 'dark',
        accentColor: '#ff0000',
        highContrastMode: true,
      };

      return request(app.getHttpServer())
        .put('/settings/theme')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.theme).toEqual('dark');
          expect(res.body.accentColor).toEqual('#ff0000');
          expect(res.body.highContrastMode).toEqual(true);
        });
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .put('/settings/theme')
        .send({ theme: 'dark' })
        .expect(401);
    });

    it('should return 400 for invalid theme value', () => {
      return request(app.getHttpServer())
        .put('/settings/theme')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ theme: 'invalid-theme' })
        .expect(400);
    });
  });
});