import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from '../../entities/workflow.entity';
import { WorkflowInstance } from '../../entities/workflow-instance.entity';
import { CreateWorkflowDto } from '../dtos/create-workflow.dto';
import { UpdateWorkflowDto } from '../dtos/update-workflow.dto';
import { ApprovalActionDto } from '../dtos/approval-action.dto';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowInstance)
    private workflowInstanceRepository: Repository<WorkflowInstance>,
  ) {}

  async create(createWorkflowDto: CreateWorkflowDto): Promise<Workflow> {
    const workflow = this.workflowRepository.create(createWorkflowDto);
    return this.workflowRepository.save(workflow);
  }

  async findAll(): Promise<Workflow[]> {
    return this.workflowRepository.find();
  }

  async findOne(id: string): Promise<Workflow> {
    const workflow = await this.workflowRepository.findOne({
      where: { id },
    });
    
    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }
    
    return workflow;
  }

  async update(id: string, updateWorkflowDto: UpdateWorkflowDto): Promise<Workflow> {
    const workflow = await this.findOne(id);
    Object.assign(workflow, updateWorkflowDto);
    return this.workflowRepository.save(workflow);
  }

  async remove(id: string): Promise<void> {
    const workflow = await this.findOne(id);
    await this.workflowRepository.remove(workflow);
  }

  async createWorkflowInstance(
    workflowId: string,
    resourceId: string,
    resourceType: string,
  ): Promise<WorkflowInstance> {
    // Verify workflow exists
    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId },
    });
    
    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${workflowId} not found`);
    }
    
    const workflowInstance = this.workflowInstanceRepository.create({
      workflowId,
      resourceId,
      resourceType,
      currentStep: workflow.steps[0], // Start with the first step
      status: 'pending',
      approvalHistory: [],
    });
    
    return this.workflowInstanceRepository.save(workflowInstance);
  }

  async getWorkflowInstances(workflowId: string): Promise<WorkflowInstance[]> {
    // Verify workflow exists
    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId },
    });
    
    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${workflowId} not found`);
    }
    
    return this.workflowInstanceRepository.find({
      where: { workflowId },
    });
  }

  async approveWorkflowStep(
    instanceId: string,
    approvalActionDto: ApprovalActionDto,
  ): Promise<WorkflowInstance> {
    const workflowInstance = await this.workflowInstanceRepository.findOne({
      where: { id: instanceId },
    });
    
    if (!workflowInstance) {
      throw new NotFoundException(`Workflow instance with ID ${instanceId} not found`);
    }
    
    // Add approval to history
    workflowInstance.approvalHistory.push({
      userId: approvalActionDto.userId,
      action: approvalActionDto.action,
      timestamp: new Date(),
      comments: approvalActionDto.comments,
    });
    
    // Update status based on approval
    if (approvalActionDto.action === 'approved') {
      // Check if all required approvals are met
      // For simplicity, we'll just mark as completed after one approval
      workflowInstance.status = 'completed';
    } else {
      workflowInstance.status = 'rejected';
    }
    
    return this.workflowInstanceRepository.save(workflowInstance);
  }

  async rejectWorkflowStep(
    instanceId: string,
    approvalActionDto: ApprovalActionDto,
  ): Promise<WorkflowInstance> {
    return this.approveWorkflowStep(instanceId, approvalActionDto);
  }
}