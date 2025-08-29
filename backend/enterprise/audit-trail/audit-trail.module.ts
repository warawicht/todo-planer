import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditTrailController } from './controllers/audit-trail.controller';
import { AuditTrailService } from './services/audit-trail.service';
import { AuditTrail } from '../entities/audit-trail.entity';
import { User } from '../../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditTrail, User])],
  controllers: [AuditTrailController],
  providers: [AuditTrailService],
  exports: [AuditTrailService],
})
export class AuditTrailModule {}