import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeBlocksModule } from '../src/time-blocks/time-blocks.module';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { TasksModule } from '../src/tasks/tasks.module';
import { DataSource } from 'typeorm';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { LoginDto } from '../src/auth/dto/login.dto';

describe('TimeBlocksController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
          synchronize: true,
        }),
        AuthModule,
        UsersModule,
        TasksModule,
        TimeBlocksModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Create a test user
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
    };

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(createUserDto)
      .expect(201);

    // Get user ID
    const userRepo = dataSource.getRepository('User');
    const user = await userRepo.findOne({ where: { email: 'test@example.com' } });
    userId = user.id;

    // Login to get auth token
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(200);

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/time-blocks (POST)', () => {
    it('should create a time block', () => {
      return request(app.getHttpServer())
        .post('/time-blocks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Time Block',
          description: 'Test Description',
          startTime: '2023-01-01T09:00:00Z',
          endTime: '2023-01-01T10:00:00Z',
          color: '#FF0000',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            title: 'Test Time Block',
            description: 'Test Description',
            color: '#FF0000',
            userId: userId,
          });
          expect(res.body.id).toBeDefined();
          expect(res.body.startTime).toBe('2023-01-01T09:00:00.000Z');
          expect(res.body.endTime).toBe('2023-01-01T10:00:00.000Z');
        });
    });

    it('should return 409 Conflict when time blocks overlap', async () => {
      // Create first time block
      await request(app.getHttpServer())
        .post('/time-blocks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'First Time Block',
          startTime: '2023-01-01T09:00:00Z',
          endTime: '2023-01-01T10:00:00Z',
        })
        .expect(201);

      // Try to create overlapping time block
      return request(app.getHttpServer())
        .post('/time-blocks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Overlapping Time Block',
          startTime: '2023-01-01T09:30:00Z',
          endTime: '2023-01-01T10:30:00Z',
        })
        .expect(409);
    });
  });

  describe('/time-blocks (GET)', () => {
    it('should return all time blocks for the user', async () => {
      const response = await request(app.getHttpServer())
        .get('/time-blocks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter time blocks by date range', async () => {
      // Create a time block in January 2023
      await request(app.getHttpServer())
        .post('/time-blocks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'January Time Block',
          startTime: '2023-01-15T09:00:00Z',
          endTime: '2023-01-15T10:00:00Z',
        })
        .expect(201);

      // Filter for January 2023
      const response = await request(app.getHttpServer())
        .get('/time-blocks?startDate=2023-01-01&endDate=2023-01-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('/time-blocks/:id (GET)', () => {
    let timeBlockId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/time-blocks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Time Block',
          startTime: '2023-01-01T09:00:00Z',
          endTime: '2023-01-01T10:00:00Z',
        })
        .expect(201);

      timeBlockId = response.body.id;
    });

    it('should return a specific time block', () => {
      return request(app.getHttpServer())
        .get(`/time-blocks/${timeBlockId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: timeBlockId,
            title: 'Test Time Block',
          });
        });
    });

    it('should return 404 for non-existent time block', () => {
      return request(app.getHttpServer())
        .get('/time-blocks/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/time-blocks/:id (PATCH)', () => {
    let timeBlockId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/time-blocks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Original Title',
          startTime: '2023-01-01T09:00:00Z',
          endTime: '2023-01-01T10:00:00Z',
        })
        .expect(201);

      timeBlockId = response.body.id;
    });

    it('should update a time block', () => {
      return request(app.getHttpServer())
        .patch(`/time-blocks/${timeBlockId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated Description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: timeBlockId,
            title: 'Updated Title',
            description: 'Updated Description',
          });
        });
    });

    it('should return 409 Conflict when update causes overlap', async () => {
      // Create another time block
      await request(app.getHttpServer())
        .post('/time-blocks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Second Time Block',
          startTime: '2023-01-01T11:00:00Z',
          endTime: '2023-01-01T12:00:00Z',
        })
        .expect(201);

      // Try to update first time block to overlap with second
      return request(app.getHttpServer())
        .patch(`/time-blocks/${timeBlockId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          endTime: '2023-01-01T11:30:00Z',
        })
        .expect(409);
    });
  });

  describe('/time-blocks/:id (DELETE)', () => {
    let timeBlockId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/time-blocks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Time Block',
          startTime: '2023-01-01T09:00:00Z',
          endTime: '2023-01-01T10:00:00Z',
        })
        .expect(201);

      timeBlockId = response.body.id;
    });

    it('should delete a time block', () => {
      return request(app.getHttpServer())
        .delete(`/time-blocks/${timeBlockId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should return 404 when trying to delete non-existent time block', () => {
      return request(app.getHttpServer())
        .delete('/time-blocks/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});