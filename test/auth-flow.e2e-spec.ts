import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication Flow (e2e)', () => {
  let app: INestApplication;

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

  it('should register a new user', () => {
    // Use a unique email for each test run to avoid conflicts
    const uniqueEmail = `test_${Date.now()}@example.com`;
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: uniqueEmail,
        password: 'Test123!@#Password',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.user.email).toBe(uniqueEmail);
        // Store the email for later use in other tests
        (global as any).testUserEmail2 = uniqueEmail;
      });
  });

  it('should login with valid credentials', () => {
    // Use the same email as registration
    const testEmail = (global as any).testUserEmail2 || 'test@example.com';
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: 'Test123!@#Password',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.accessToken).toBeDefined();
      });
  });

  it('should get user profile with valid token', () => {
    // Use a unique email for this test to avoid conflicts
    const uniqueEmail = `profiletest_${Date.now()}@example.com`;
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: uniqueEmail,
        password: 'Test123!@#Password',
        firstName: 'Profile',
        lastName: 'Tester',
      })
      .expect(201)
      .then(() => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: uniqueEmail,
            password: 'Test123!@#Password',
          })
          .expect(200)
          .then((loginRes) => {
            const accessToken = loginRes.body.accessToken;
            return request(app.getHttpServer())
              .get('/auth/profile')
              .set('Authorization', `Bearer ${accessToken}`)
              .expect(200)
              .expect((res) => {
                expect(res.body.success).toBe(true);
                expect(res.body.user.email).toBe(uniqueEmail);
              });
          });
      });
  });

  it('should logout successfully', () => {
    // Use a unique email for this test to avoid conflicts
    const uniqueEmail = `logouttest_${Date.now()}@example.com`;
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: uniqueEmail,
        password: 'Test123!@#Password',
        firstName: 'Logout',
        lastName: 'Tester',
      })
      .expect(201)
      .then(() => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: uniqueEmail,
            password: 'Test123!@#Password',
          })
          .expect(200)
          .then((loginRes) => {
            // The login response should contain both accessToken and refreshToken
            expect(loginRes.body.accessToken).toBeDefined();
            expect(loginRes.body.refreshToken).toBeDefined();
            
            // Send refreshToken in the body for testing purposes
            return request(app.getHttpServer())
              .post('/auth/logout')
              .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
              .send({ refreshToken: loginRes.body.refreshToken })
              .expect(200)
              .expect((res) => {
                expect(res.body.success).toBe(true);
              });
          });
      });
  });
});