import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Subtasks and Attachments (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let taskId: string;
  let subtaskId: string;
  let attachmentId: string;

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
    // Use a unique email for each test run to avoid conflicts
    const uniqueEmail = `subtasktest_${Date.now()}@example.com`;
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: uniqueEmail,
        password: 'Test123!@#Password',
        firstName: 'Subtask',
        lastName: 'Tester',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.user.email).toBe(uniqueEmail);
        // Store the email for later use in other tests
        (global as any).testSubtaskUserEmail = uniqueEmail;
      });
  });

  it('should login with valid credentials', () => {
    // Use the same email as registration
    const testEmail = (global as any).testSubtaskUserEmail || 'subtasktest@example.com';
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: 'Test123!@#Password',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
        accessToken = res.body.accessToken;
      });
  });

  it('should create a new task for subtask testing', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Parent Task',
        description: 'This is a parent task for subtask testing',
        priority: 1,
        status: 'pending'
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.title).toBe('Parent Task');
        taskId = res.body.id;
      });
  });

  // Subtask tests
  it('should create a subtask', () => {
    return request(app.getHttpServer())
      .post(`/tasks/${taskId}/subtasks`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Test Subtask',
        description: 'This is a test subtask',
        priority: 2,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.title).toBe('Test Subtask');
        expect(res.body.description).toBe('This is a test subtask');
        expect(res.body.priority).toBe(2);
        expect(res.body.parentId).toBe(taskId);
        subtaskId = res.body.id;
      });
  });

  it('should retrieve all subtasks for a task', () => {
    return request(app.getHttpServer())
      .get(`/tasks/${taskId}/subtasks`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toBe(subtaskId);
        expect(res.body[0].title).toBe('Test Subtask');
      });
  });

  it('should update a subtask', () => {
    return request(app.getHttpServer())
      .put(`/tasks/${taskId}/subtasks/${subtaskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated Test Subtask',
        priority: 3,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(subtaskId);
        expect(res.body.title).toBe('Updated Test Subtask');
        expect(res.body.priority).toBe(3);
      });
  });

  it('should reorder subtasks', () => {
    // First create another subtask
    return request(app.getHttpServer())
      .post(`/tasks/${taskId}/subtasks`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Second Subtask',
        priority: 1,
      })
      .expect(201)
      .then(() => {
        // Then reorder the first subtask to position 1
        return request(app.getHttpServer())
          .put(`/tasks/${taskId}/subtasks/${subtaskId}/move`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            position: 1,
          })
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            // The moved subtask should now be at position 1
            const movedSubtask = res.body.find(task => task.id === subtaskId);
            expect(movedSubtask.position).toBe(1);
          });
      });
  });

  it('should convert a subtask to a regular task', () => {
    return request(app.getHttpServer())
      .post(`/tasks/${taskId}/subtasks/${subtaskId}/convert`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(subtaskId);
        expect(res.body.parentId).toBeNull();
      });
  });

  it('should delete a subtask', () => {
    // First create another subtask to delete
    return request(app.getHttpServer())
      .post(`/tasks/${taskId}/subtasks`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Subtask to Delete',
      })
      .expect(201)
      .then((res) => {
        const deleteSubtaskId = res.body.id;
        return request(app.getHttpServer())
          .delete(`/tasks/${taskId}/subtasks/${deleteSubtaskId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .expect((response) => {
            expect(response.body.message).toBe('Subtask deleted successfully');
          });
      });
  });

  // Attachment tests
  it('should upload a file attachment', () => {
    // Create a simple text file for testing
    const testFile = Buffer.from('This is a test file for attachment testing');
    
    return request(app.getHttpServer())
      .post(`/tasks/${taskId}/attachments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', testFile, 'test.txt')
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.fileName).toBeDefined();
        expect(res.body.originalName).toBe('test.txt');
        expect(res.body.mimeType).toBe('text/plain');
        expect(res.body.fileSize).toBe(testFile.length);
        attachmentId = res.body.id;
      });
  });

  it('should list all attachments for a task', () => {
    return request(app.getHttpServer())
      .get(`/tasks/${taskId}/attachments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toBe(attachmentId);
        expect(res.body[0].originalName).toBe('test.txt');
      });
  });

  it('should delete an attachment', () => {
    return request(app.getHttpServer())
      .delete(`/tasks/${taskId}/attachments/${attachmentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('Attachment deleted successfully');
      });
  });

  // Error handling tests
  it('should return 404 when trying to access non-existent subtask', () => {
    return request(app.getHttpServer())
      .get(`/tasks/${taskId}/subtasks/invalid-id`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('should return 404 when trying to access non-existent attachment', () => {
    return request(app.getHttpServer())
      .get(`/tasks/${taskId}/attachments/invalid-id`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('should return 400 for invalid subtask move request', () => {
    return request(app.getHttpServer())
      .put(`/tasks/${taskId}/subtasks/${subtaskId}/move`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        // Missing position parameter
      })
      .expect(400);
  });
});