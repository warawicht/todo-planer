import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilePreference } from '../../src/settings/entities/profile-preference.entity';
import { User } from '../../src/users/user.entity';
import { SettingsModule } from '../../src/settings/settings.module';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';

describe('ProfilePreferenceController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, ProfilePreference],
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
        email: 'test3@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });

    userId = registerResponse.body.user.id;
    
    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test3@example.com',
        password: 'Password123!',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/settings/profile (GET)', () => {
    it('should get profile preferences', async () => {
      return request(app.getHttpServer())
        .get('/settings/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('firstName');
          expect(res.body).toHaveProperty('lastName');
          expect(res.body).toHaveProperty('avatarUrl');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .get('/settings/profile')
        .expect(401);
    });
  });

  describe('/settings/profile (PUT)', () => {
    it('should update profile preferences', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      return request(app.getHttpServer())
        .put('/settings/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.firstName).toEqual('Updated');
          expect(res.body.lastName).toEqual('Name');
        });
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .put('/settings/profile')
        .send({ firstName: 'Updated' })
        .expect(401);
    });

    it('should return 400 for invalid input', () => {
      return request(app.getHttpServer())
        .put('/settings/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'A'.repeat(100) }) // Too long
        .expect(400);
    });
  });

  describe('/settings/profile/avatar (POST)', () => {
    it('should handle avatar upload', async () => {
      // Note: This is a simplified test since actual file upload testing
      // would require more complex setup
      return request(app.getHttpServer())
        .post('/settings/profile/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('avatar', Buffer.from('test'), 'test.png')
        .expect(200);
    });

    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer())
        .post('/settings/profile/avatar')
        .attach('avatar', Buffer.from('test'), 'test.png')
        .expect(401);
    });
  });
});