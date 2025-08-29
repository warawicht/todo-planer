import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ThemePreferenceService } from '../services/theme-preference.service';
import { ThemePreferenceDto, ThemePreferenceResponseDto } from '../dto/theme-preference.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('settings/theme')
@UseGuards(JwtAuthGuard)
export class ThemePreferenceController {
  constructor(private readonly themePreferenceService: ThemePreferenceService) {}

  @Get()
  async getThemePreference(@Request() req): Promise<ThemePreferenceResponseDto> {
    const themePreference = await this.themePreferenceService.getThemePreference(req.user.id);
    return {
      theme: themePreference.theme,
      accentColor: themePreference.accentColor,
      highContrastMode: themePreference.highContrastMode,
      updatedAt: themePreference.updatedAt,
    };
  }

  @Put()
  async updateThemePreference(
    @Request() req,
    @Body() themePreferenceDto: ThemePreferenceDto,
  ): Promise<ThemePreferenceResponseDto> {
    const themePreference = await this.themePreferenceService.updateThemePreference(
      req.user.id,
      themePreferenceDto,
    );
    return {
      theme: themePreference.theme,
      accentColor: themePreference.accentColor,
      highContrastMode: themePreference.highContrastMode,
      updatedAt: themePreference.updatedAt,
    };
  }
}