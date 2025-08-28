import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThemePreference } from './entities/theme-preference.entity';
import { TimezonePreference } from './entities/timezone-preference.entity';
import { ProfilePreference } from './entities/profile-preference.entity';
import { DataExport } from './entities/data-export.entity';
import { ThemePreferenceService } from './services/theme-preference.service';
import { TimezonePreferenceService } from './services/timezone-preference.service';
import { ProfilePreferenceService } from './services/profile-preference.service';
import { DataExportService } from './services/data-export.service';
import { ThemePreferenceController } from './controllers/theme-preference.controller';
import { TimezonePreferenceController } from './controllers/timezone-preference.controller';
import { ProfilePreferenceController } from './controllers/profile-preference.controller';
import { DataExportController } from './controllers/data-export.controller';
import { TasksModule } from '../tasks/tasks.module';
import { ProjectsModule } from '../projects/projects.module';
import { TimeBlocksModule } from '../time-blocks/time-blocks.module';
import { FileUploadService } from './services/file-upload.service';
import { SettingsCacheService } from './services/settings-cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ThemePreference,
      TimezonePreference,
      ProfilePreference,
      DataExport,
    ]),
    TasksModule,
    ProjectsModule,
    TimeBlocksModule,
  ],
  providers: [
    ThemePreferenceService,
    TimezonePreferenceService,
    ProfilePreferenceService,
    DataExportService,
    FileUploadService,
    SettingsCacheService,
  ],
  controllers: [
    ThemePreferenceController,
    TimezonePreferenceController,
    ProfilePreferenceController,
    DataExportController,
  ],
  exports: [
    ThemePreferenceService,
    TimezonePreferenceService,
    ProfilePreferenceService,
    DataExportService,
    FileUploadService,
    SettingsCacheService,
  ],
})
export class SettingsModule {}