import { Module, CacheModule, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-ioredis';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { UserManagementModule } from './user-management/user-management.module';
import { ActivityLoggingModule } from './activity-logging/activity-logging.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { AuditTrailModule } from './audit-trail/audit-trail.module';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { ActivityLog } from './entities/activity-log.entity';
import { Workflow } from './entities/workflow.entity';
import { WorkflowInstance } from './entities/workflow-instance.entity';
import { AuditTrail } from './entities/audit-trail.entity';
import { PermissionCheckerService } from './services/permission-checker.service';
import { UsersModule } from '../users/users.module';
import { ActivityLoggingMiddleware } from './middleware/activity-logging.middleware';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      ttl: 300, // 5 minutes
    }),
    TypeOrmModule.forFeature([
      Role,
      Permission,
      UserRole,
      RolePermission,
      ActivityLog,
      Workflow,
      WorkflowInstance,
      AuditTrail,
    ]),
    RolesModule,
    PermissionsModule,
    UserManagementModule,
    ActivityLoggingModule,
    WorkflowsModule,
    AuditTrailModule,
    UsersModule,
  ],
  providers: [PermissionCheckerService],
  exports: [
    RolesModule,
    PermissionsModule,
    UserManagementModule,
    ActivityLoggingModule,
    WorkflowsModule,
    AuditTrailModule,
    PermissionCheckerService,
    CacheModule,
  ],
})
export class EnterpriseModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ActivityLoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}