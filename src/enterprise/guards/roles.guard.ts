import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
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
    const userWithRoles = await this.usersService.findById(user.id);
    
    if (!userWithRoles) {
      return false;
    }
    
    // Get user roles
    const userRoles = await this.usersService.getUserRoles(userWithRoles.id);
    
    // Check if user has any of the required roles
    return requiredRoles.some((role) => 
      userRoles.some((userRole) => userRole.name === role)
    );
  }
}