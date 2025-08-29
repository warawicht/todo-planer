import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkflowsService } from '../services/workflows.service';
import { CreateWorkflowDto } from '../dtos/create-workflow.dto';
import { UpdateWorkflowDto } from '../dtos/update-workflow.dto';
import { ApprovalActionDto } from '../dtos/approval-action.dto';
import { Workflow } from '../../entities/workflow.entity';
import { WorkflowInstance } from '../../entities/workflow-instance.entity';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createWorkflowDto: CreateWorkflowDto,
  ): Promise<{ success: boolean; workflow: Workflow }> {
    const workflow = await this.workflowsService.create(createWorkflowDto);
    return {
      success: true,
      workflow,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<{ success: boolean; workflows: Workflow[] }> {
    const workflows = await this.workflowsService.findAll();
    return {
      success: true,
      workflows,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<{ success: boolean; workflow: Workflow }> {
    const workflow = await this.workflowsService.findOne(id);
    return {
      success: true,
      workflow,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
  ): Promise<{ success: boolean; workflow: Workflow }> {
    const workflow = await this.workflowsService.update(id, updateWorkflowDto);
    return {
      success: true,
      workflow,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.workflowsService.remove(id);
    return {
      success: true,
      message: 'Workflow deleted successfully',
    };
  }

  @Post(':workflowId/instances')
  @HttpCode(HttpStatus.CREATED)
  async createWorkflowInstance(
    @Param('workflowId') workflowId: string,
    @Body('resourceId') resourceId: string,
    @Body('resourceType') resourceType: string,
  ): Promise<{ success: boolean; instance: WorkflowInstance }> {
    const instance = await this.workflowsService.createWorkflowInstance(
      workflowId,
      resourceId,
      resourceType,
    );
    return {
      success: true,
      instance,
    };
  }

  @Get(':workflowId/instances')
  @HttpCode(HttpStatus.OK)
  async getWorkflowInstances(
    @Param('workflowId') workflowId: string,
  ): Promise<{ success: boolean; instances: WorkflowInstance[] }> {
    const instances = await this.workflowsService.getWorkflowInstances(workflowId);
    return {
      success: true,
      instances,
    };
  }

  @Post('workflow-instances/:instanceId/approve')
  @HttpCode(HttpStatus.OK)
  async approveWorkflowStep(
    @Param('instanceId') instanceId: string,
    @Body() approvalActionDto: ApprovalActionDto,
  ): Promise<{ success: boolean; instance: WorkflowInstance }> {
    const instance = await this.workflowsService.approveWorkflowStep(instanceId, approvalActionDto);
    return {
      success: true,
      instance,
    };
  }

  @Post('workflow-instances/:instanceId/reject')
  @HttpCode(HttpStatus.OK)
  async rejectWorkflowStep(
    @Param('instanceId') instanceId: string,
    @Body() approvalActionDto: ApprovalActionDto,
  ): Promise<{ success: boolean; instance: WorkflowInstance }> {
    const instance = await this.workflowsService.rejectWorkflowStep(instanceId, approvalActionDto);
    return {
      success: true,
      instance,
    };
  }
}