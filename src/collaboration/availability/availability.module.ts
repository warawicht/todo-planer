import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityController } from './controllers/availability.controller';
import { AvailabilityService } from './services/availability.service';
import { UserAvailability } from './entities/user-availability.entity';
import { User } from '../../users/user.entity';
import { InputSanitizationService } from '../services/input-sanitization.service';
import { CollaborationCacheService } from '../services/collaboration-cache.service';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([UserAvailability, User]),
  ],
  controllers: [AvailabilityController],
  providers: [
    AvailabilityService,
    InputSanitizationService,
    CollaborationCacheService,
  ],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}