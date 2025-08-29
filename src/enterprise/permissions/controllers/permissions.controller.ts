import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PermissionsService } from '../services/permissions.service';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { UpdatePermissionDto } from '../dtos/update-permission.dto';
import { Permission } from '../../entities/permission.entity';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<{ success: boolean; permission: Permission }> {
    const permission = await this.permissionsService.create(createPermissionDto);
    return {
      success: true,
      permission,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<{ success: boolean; permissions: Permission[] }> {
    const permissions = await this.permissionsService.findAll();
    return {
      success: true,
      permissions,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<{ success: boolean; permission: Permission }> {
    const permission = await this.permissionsService.findOne(id);
    return {
      success: true,
      permission,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<{ success: boolean; permission: Permission }> {
    const permission = await this.permissionsService.update(id, updatePermissionDto);
    return {
      success: true,
      permission,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.permissionsService.remove(id);
    return {
      success: true,
      message: 'Permission deleted successfully',
    };
  }

  @Post(':roleId/permissions')
  @HttpCode(HttpStatus.CREATED)
  async assignPermissionToRole(
    @Param('roleId') roleId: string,
    @Body('permissionId') permissionId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.permissionsService.assignPermissionToRole(roleId, permissionId);
    return {
      success: true,
      message: 'Permission assigned to role successfully',
    };
  }

  @Delete(':roleId/permissions/:permissionId')
  @HttpCode(HttpStatus.OK)
  async removePermissionFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.permissionsService.removePermissionFromRole(roleId, permissionId);
    return {
      success: true,
      message: 'Permission removed from role successfully',
    };
  }
}