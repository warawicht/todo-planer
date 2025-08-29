import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsController } from './controllers/permissions.controller';
import { PermissionsService } from './services/permissions.service';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { PermissionCheckerService } from '../services/permission-checker.service';
import { User } from '../../users/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, RolePermission, User, Role, UserRole]),
    CacheModule.register(),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionCheckerService],
  exports: [PermissionsService],
})
export class PermissionsModule {}