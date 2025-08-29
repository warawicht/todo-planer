import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { UserRole } from '../entities/user-role.entity';
import { RolePermission } from '../entities/role-permission.entity';

@Injectable()
export class PermissionCheckerService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getUserRoles(userId: string): Promise<Role[]> {
    // Try to get from cache first
    const cachedRoles = await this.cacheManager.get<Role[]>(`user_roles_${userId}`);
    if (cachedRoles) {
      return cachedRoles;
    }

    const userRoles = await this.userRoleRepository.find({
      where: { userId, isActive: true },
      relations: ['role'],
    });
    
    const roles = userRoles.map(userRole => userRole.role);
    
    // Cache the result for 5 minutes
    await this.cacheManager.set(`user_roles_${userId}`, roles, 300000);
    
    return roles;
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    // Try to get from cache first
    const cachedPermissions = await this.cacheManager.get<Permission[]>(`role_permissions_${roleId}`);
    if (cachedPermissions) {
      return cachedPermissions;
    }

    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });
    
    const permissions = rolePermissions.map(rolePermission => rolePermission.permission);
    
    // Cache the result for 5 minutes
    await this.cacheManager.set(`role_permissions_${roleId}`, permissions, 300000);
    
    return permissions;
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    // Try to get from cache first
    const cachedPermissions = await this.cacheManager.get<Permission[]>(`user_permissions_${userId}`);
    if (cachedPermissions) {
      return cachedPermissions;
    }

    const userRoles = await this.getUserRoles(userId);
    const permissions: Permission[] = [];
    
    for (const role of userRoles) {
      const rolePermissions = await this.getRolePermissions(role.id);
      permissions.push(...rolePermissions);
    }
    
    // Remove duplicates
    const uniquePermissions = permissions.filter(
      (permission, index, self) =>
        index === self.findIndex((p) => p.id === permission.id)
    );
    
    // Cache the result for 5 minutes
    await this.cacheManager.set(`user_permissions_${userId}`, uniquePermissions, 300000);
    
    return uniquePermissions;
  }

  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    
    return userPermissions.some(
      permission => 
        permission.resource === resource && 
        permission.action === action
    );
  }

  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    
    return userRoles.some(role => role.name === roleName);
  }

  // Method to clear cache when roles or permissions are updated
  async clearUserCache(userId: string): Promise<void> {
    await this.cacheManager.del(`user_roles_${userId}`);
    await this.cacheManager.del(`user_permissions_${userId}`);
  }

  async clearRoleCache(roleId: string): Promise<void> {
    await this.cacheManager.del(`role_permissions_${roleId}`);
  }
}