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
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { Role } from '../../entities/role.entity';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRoleDto: CreateRoleDto): Promise<{ success: boolean; role: Role }> {
    const role = await this.rolesService.create(createRoleDto);
    return {
      success: true,
      role,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<{ success: boolean; roles: Role[] }> {
    const roles = await this.rolesService.findAll();
    return {
      success: true,
      roles,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<{ success: boolean; role: Role }> {
    const role = await this.rolesService.findOne(id);
    return {
      success: true,
      role,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<{ success: boolean; role: Role }> {
    const role = await this.rolesService.update(id, updateRoleDto);
    return {
      success: true,
      role,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.rolesService.remove(id);
    return {
      success: true,
      message: 'Role deleted successfully',
    };
  }
}