import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamCalendarController } from './controllers/team-calendar.controller';
import { TeamCalendarService } from './services/team-calendar.service';
import { User } from '../../users/user.entity';
import { TimeBlock } from '../../time-blocks/entities/time-block.entity';
import { UserAvailability } from '../availability/entities/user-availability.entity';
import { VirtualScrollingService } from '../../time-blocks/services/virtual-scrolling.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, TimeBlock, UserAvailability]),
  ],
  controllers: [TeamCalendarController],
  providers: [TeamCalendarService, VirtualScrollingService],
  exports: [TeamCalendarService],
})
export class TeamCalendarModule {}