import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../users/user.entity';
import { UserRole } from '../../entities/user-role.entity';
import { Role } from '../../entities/role.entity';
import { PermissionCheckerService } from '../../services/permission-checker.service';

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private permissionCheckerService: PermissionCheckerService,
  ) {}

  async findAll(page: number = 1, limit: number = 10, status?: string): Promise<{ users: User[]; total: number }> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');
    
    if (status) {
      queryBuilder.where('user.isActive = :status', { status: status === 'active' });
    }
    
    const [users, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
      
    return { users, total };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = isActive;
    return this.usersRepository.save(user);
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<UserRole> {
    // Check if role exists
    const role = await this.rolesRepository.findOne({
      where: { id: roleId },
    });
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
    
    // Create user role association
    const userRole = this.userRoleRepository.create({
      userId,
      roleId,
    });
    
    const result = await this.userRoleRepository.save(userRole);
    
    // Clear cache for this user
    await this.permissionCheckerService.clearUserCache(userId);
    
    return result;
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });
    
    if (userRole) {
      await this.userRoleRepository.remove(userRole);
      
      // Clear cache for this user
      await this.permissionCheckerService.clearUserCache(userId);
    }
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
    });
    
    return userRoles.map(userRole => userRole.role);
  }
}