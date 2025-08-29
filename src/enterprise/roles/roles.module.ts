import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './controllers/roles.controller';
import { RolesService } from './services/roles.service';
import { Role } from '../entities/role.entity';
import { PermissionCheckerService } from '../services/permission-checker.service';
import { User } from '../../users/user.entity';
import { Permission } from '../entities/permission.entity';
import { UserRole } from '../entities/user-role.entity';
import { RolePermission } from '../entities/role-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, User, Permission, UserRole, RolePermission]),
    CacheModule.register(),
  ],
  controllers: [RolesController],
  providers: [RolesService, PermissionCheckerService],
  exports: [RolesService],
})
export class RolesModule {}