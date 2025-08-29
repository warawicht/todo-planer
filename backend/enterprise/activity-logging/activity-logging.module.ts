import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLoggingController } from './controllers/activity-logging.controller';
import { ActivityLoggingService } from './services/activity-logging.service';
import { ActivityLog } from '../entities/activity-log.entity';
import { User } from '../../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog, User])],
  controllers: [ActivityLoggingController],
  providers: [ActivityLoggingService],
  exports: [ActivityLoggingService],
})
export class ActivityLoggingModule {}