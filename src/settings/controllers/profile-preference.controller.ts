import { Controller, Get, Put, Post, Body, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilePreferenceService } from '../services/profile-preference.service';
import { ProfilePreferenceDto, ProfilePreferenceResponseDto } from '../dto/profile-preference.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FileUploadService } from '../services/file-upload.service';

@Controller('settings/profile')
@UseGuards(JwtAuthGuard)
export class ProfilePreferenceController {
  constructor(
    private readonly profilePreferenceService: ProfilePreferenceService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get()
  async getProfilePreference(@Request() req): Promise<ProfilePreferenceResponseDto> {
    const profilePreference = await this.profilePreferenceService.getProfilePreference(req.user.id);
    return {
      firstName: profilePreference.firstName,
      lastName: profilePreference.lastName,
      avatarUrl: profilePreference.avatarUrl,
      updatedAt: profilePreference.updatedAt,
    };
  }

  @Put()
  async updateProfilePreference(
    @Request() req,
    @Body() profilePreferenceDto: ProfilePreferenceDto,
  ): Promise<ProfilePreferenceResponseDto> {
    const profilePreference = await this.profilePreferenceService.updateProfilePreference(
      req.user.id,
      profilePreferenceDto,
    );
    return {
      firstName: profilePreference.firstName,
      lastName: profilePreference.lastName,
      avatarUrl: profilePreference.avatarUrl,
      updatedAt: profilePreference.updatedAt,
    };
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', FileUploadService.avatarUploadOptions))
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProfilePreferenceResponseDto> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Save the file and get the URL
    const avatarUrl = await this.fileUploadService.saveAvatar(file, req.user.id);
    
    const profilePreference = await this.profilePreferenceService.updateAvatarUrl(
      req.user.id,
      avatarUrl,
    );
    
    return {
      firstName: profilePreference.firstName,
      lastName: profilePreference.lastName,
      avatarUrl: profilePreference.avatarUrl,
      updatedAt: profilePreference.updatedAt,
    };
  }
}