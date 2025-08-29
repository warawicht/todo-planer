import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  HttpCode,
} from '@nestjs/common';
import { AvailabilityService } from '../services/availability.service';
import { CreateUserAvailabilityDto } from '../dto/create-user-availability.dto';
import { UpdateUserAvailabilityDto } from '../dto/update-user-availability.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { UserAvailability } from '../entities/user-availability.entity';

@Controller('api/availability')
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  async setUserAvailability(
    @Request() req,
    @Body() createUserAvailabilityDto: CreateUserAvailabilityDto,
  ): Promise<UserAvailability> {
    return this.availabilityService.setUserAvailability(req.user.id, createUserAvailabilityDto);
  }

  @Get()
  async getUserAvailability(
    @Request() req,
  ): Promise<UserAvailability[]> {
    return this.availabilityService.getUserAvailability(req.user.id);
  }

  @Get('team')
  async getTeamAvailability(
    @Query('userIds') userIds: string[],
  ): Promise<UserAvailability[]> {
    return this.availabilityService.getTeamAvailability(userIds);
  }

  @Put(':availabilityId')
  async updateAvailability(
    @Param('availabilityId') availabilityId: string,
    @Request() req,
    @Body() updateUserAvailabilityDto: UpdateUserAvailabilityDto,
  ): Promise<UserAvailability> {
    return this.availabilityService.updateAvailability(availabilityId, req.user.id, updateUserAvailabilityDto);
  }

  @Delete(':availabilityId')
  @HttpCode(204)
  async deleteAvailability(
    @Param('availabilityId') availabilityId: string,
    @Request() req,
  ): Promise<void> {
    return this.availabilityService.deleteAvailability(availabilityId, req.user.id);
  }
}