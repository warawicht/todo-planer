import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserManagementService } from '../user-management/services/user-management.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userManagementService: UserManagementService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    const userWithRoles = await this.userManagementService.findOne(user.id);
    
    if (!userWithRoles) {
      return false;
    }
    
    // Get user roles
    const userRoles = await this.userManagementService.getUserRoles(userWithRoles.id);
    
    // Check if user has any of the required roles
    return requiredRoles.some((role) => 
      userRoles.some((userRole) => userRole.name === role)
    );
  }
}