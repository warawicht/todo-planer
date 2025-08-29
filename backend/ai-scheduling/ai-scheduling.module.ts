import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// Entities
import { AISuggestion } from './entities/ai-suggestion.entity';
import { ProductivityPattern } from './entities/productivity-pattern.entity';
import { TaskPriorityRecommendation } from './entities/task-priority-recommendation.entity';
import { NLPProcessedTask } from './entities/nlp-processed-task.entity';
// Services
import { SchedulingSuggestionService } from './services/scheduling-suggestion.service';
import { ProductivityPatternService } from './services/productivity-pattern.service';
import { TaskPrioritizationService } from './services/task-prioritization.service';
import { NLPProcessingService } from './services/nlp-processing.service';
// Controllers
import { AISchedulingController } from './controllers/ai-scheduling.controller';
// Module dependencies
import { TasksModule } from '../tasks/tasks.module';
import { TimeBlocksModule } from '../time-blocks/time-blocks.module';
import { ProductivityTrackingModule } from '../productivity-tracking/productivity-tracking.module';
import { UsersModule } from '../users/users.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AISuggestion,
      ProductivityPattern,
      TaskPriorityRecommendation,
      NLPProcessedTask,
    ]),
    TasksModule,
    TimeBlocksModule,
    ProductivityTrackingModule,
    UsersModule,
    SettingsModule,
  ],
  controllers: [AISchedulingController],
  providers: [
    SchedulingSuggestionService,
    ProductivityPatternService,
    TaskPrioritizationService,
    NLPProcessingService,
  ],
  exports: [
    SchedulingSuggestionService,
    ProductivityPatternService,
    TaskPrioritizationService,
    NLPProcessingService,
  ],
})
export class AISchedulingModule {}