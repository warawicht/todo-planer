import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowsModule } from '../../backend/enterprise/workflows/workflows.module';
import { Workflow } from '../../backend/enterprise/entities/workflow.entity';
import { WorkflowInstance } from '../../backend/enterprise/entities/workflow-instance.entity';

describe('WorkflowsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Workflow, WorkflowInstance],
          synchronize: true,
        }),
        WorkflowsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a workflow', () => {
    return request(app.getHttpServer())
      .post('/workflows')
      .send({
        name: 'Task Approval Workflow',
        description: 'Workflow for approving tasks',
        steps: [
          {
            name: 'Manager Approval',
            order: 1,
            approvers: ['manager-role-id'],
            requiredApprovals: 1,
          },
        ],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.workflow.name).toBe('Task Approval Workflow');
      });
  });

  it('should get all workflows', () => {
    return request(app.getHttpServer())
      .get('/workflows')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.workflows)).toBe(true);
      });
  });

  it('should get a workflow by ID', async () => {
    // First create a workflow
    const createResponse = await request(app.getHttpServer())
      .post('/workflows')
      .send({
        name: 'Project Approval Workflow',
        description: 'Workflow for approving projects',
        steps: [
          {
            name: 'Director Approval',
            order: 1,
            approvers: ['director-role-id'],
            requiredApprovals: 1,
          },
        ],
      });

    const workflowId = createResponse.body.workflow.id;

    // Then get the workflow by ID
    return request(app.getHttpServer())
      .get(`/workflows/${workflowId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.workflow.id).toBe(workflowId);
        expect(res.body.workflow.name).toBe('Project Approval Workflow');
      });
  });

  it('should update a workflow', async () => {
    // First create a workflow
    const createResponse = await request(app.getHttpServer())
      .post('/workflows')
      .send({
        name: 'Task Review Workflow',
        description: 'Workflow for reviewing tasks',
        steps: [
          {
            name: 'Peer Review',
            order: 1,
            approvers: ['peer-role-id'],
            requiredApprovals: 1,
          },
        ],
      });

    const workflowId = createResponse.body.workflow.id;

    // Then update the workflow
    return request(app.getHttpServer())
      .put(`/workflows/${workflowId}`)
      .send({
        name: 'Task Review Workflow Updated',
        description: 'Updated workflow for reviewing tasks',
        steps: [
          {
            name: 'Peer Review',
            order: 1,
            approvers: ['peer-role-id'],
            requiredApprovals: 1,
          },
          {
            name: 'Manager Review',
            order: 2,
            approvers: ['manager-role-id'],
            requiredApprovals: 1,
          },
        ],
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.workflow.name).toBe('Task Review Workflow Updated');
        expect(res.body.workflow.steps.length).toBe(2);
      });
  });

  it('should delete a workflow', async () => {
    // First create a workflow
    const createResponse = await request(app.getHttpServer())
      .post('/workflows')
      .send({
        name: 'Temporary Workflow',
        description: 'Temporary workflow for testing',
        steps: [
          {
            name: 'Test Approval',
            order: 1,
            approvers: ['test-role-id'],
            requiredApprovals: 1,
          },
        ],
      });

    const workflowId = createResponse.body.workflow.id;

    // Then delete the workflow
    await request(app.getHttpServer())
      .delete(`/workflows/${workflowId}`)
      .expect(200);

    // Verify the workflow is deleted
    return request(app.getHttpServer())
      .get(`/workflows/${workflowId}`)
      .expect(404);
  });
});