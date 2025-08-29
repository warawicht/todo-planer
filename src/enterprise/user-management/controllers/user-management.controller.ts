import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UserManagementService } from '../services/user-management.service';
import { User } from '../../../users/user.entity';
import { Role } from '../../entities/role.entity';
import { AssignRoleDto } from '../dtos/assign-role.dto';
import { UpdateUserStatusDto } from '../dtos/update-user-status.dto';

@Controller('users')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('status') status?: string,
  ): Promise<{ success: boolean; users: User[]; total: number }> {
    const page = Math.floor(offset / limit) + 1;
    const { users, total } = await this.userManagementService.findAll(page, limit, status);
    return {
      success: true,
      users,
      total,
    };
  }

  @Get(':userId/roles')
  @HttpCode(HttpStatus.OK)
  async getUserRoles(@Param('userId') userId: string): Promise<{ success: boolean; roles: Role[] }> {
    const roles = await this.userManagementService.getUserRoles(userId);
    return {
      success: true,
      roles,
    };
  }

  @Put(':userId/status')
  @HttpCode(HttpStatus.OK)
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<{ success: boolean; user: User }> {
    const user = await this.userManagementService.updateUserStatus(userId, updateUserStatusDto.isActive);
    return {
      success: true,
      user,
    };
  }

  @Post(':userId/roles')
  @HttpCode(HttpStatus.CREATED)
  async assignRoleToUser(
    @Param('userId') userId: string,
    @Body() assignRoleDto: AssignRoleDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.userManagementService.assignRoleToUser(userId, assignRoleDto.roleId);
    return {
      success: true,
      message: 'Role assigned to user successfully',
    };
  }

  @Delete(':userId/roles/:roleId')
  @HttpCode(HttpStatus.OK)
  async removeRoleFromUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.userManagementService.removeRoleFromUser(userId, roleId);
    return {
      success: true,
      message: 'Role removed from user successfully',
    };
  }
}