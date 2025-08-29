import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowsController } from './controllers/workflows.controller';
import { WorkflowsService } from './services/workflows.service';
import { Workflow } from '../entities/workflow.entity';
import { WorkflowInstance } from '../entities/workflow-instance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workflow, WorkflowInstance])],
  controllers: [WorkflowsController],
  providers: [WorkflowsService],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}