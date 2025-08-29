import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserManagementController } from './controllers/user-management.controller';
import { UserManagementService } from './services/user-management.service';
import { User } from '../../users/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { Role } from '../entities/role.entity';
import { PermissionCheckerService } from '../services/permission-checker.service';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, Role, Permission, RolePermission]),
    CacheModule.register(),
  ],
  controllers: [UserManagementController],
  providers: [UserManagementService, PermissionCheckerService],
  exports: [UserManagementService],
})
export class UserManagementModule {}