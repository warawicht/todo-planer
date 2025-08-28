# Settings and Customization Feature Design

## 1. Overview

This document outlines the design for the Settings and Customization feature in the Todo Planer application. Based on the requirements, this feature will allow users to customize their experience through five main areas:

1. Theme customization (light/dark mode)
2. Timezone configuration
3. Notification settings
4. Data export functionality
5. User profile management

The implementation will follow the existing patterns established in the codebase for user preferences, with new entities, services, and API endpoints to support these settings types. Each setting area will include comprehensive test cases and consideration of edge cases as specified in the requirements.

## 2. Architecture

### 2.1 Technology Stack

- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT-based authentication with existing JwtAuthGuard
- **Frontend**: React with TypeScript
- **Validation**: class-validator for input validation
- **File Upload**: Multer for avatar uploads

### 2.2 Component Structure

The settings feature will be implemented with the following components:

- **Backend Entities**: New database entities to store user settings
- **Services**: Business logic for managing settings
- **Controllers**: API endpoints for settings operations
- **DTOs**: Data transfer objects for API communication
- **Frontend Components**: UI components for settings management

### 2.3 Integration Points

- **User Entity**: All settings will be associated with the existing User entity
- **Authentication**: Settings endpoints will be protected by JWT authentication
- **Database**: Settings will be stored in PostgreSQL using TypeORM
- **Frontend**: Settings will be accessible through a dedicated settings page

## 3. Data Models

### 3.1 Theme Preference Entity

```typescript
@Entity('theme_preferences')
export class ThemePreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: ['light', 'dark', 'system'], default: 'system' })
  theme: 'light' | 'dark' | 'system';

  @Column({ default: '#4a76d4' })
  accentColor: string;

  @Column({ default: false })
  highContrastMode: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 3.2 Timezone Preference Entity

```typescript
@Entity('timezone_preferences')
export class TimezonePreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: 'UTC' })
  timezone: string;

  @Column({ default: true })
  autoDetect: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 3.3 Profile Entity

```typescript
@Entity('profile_preferences')
export class ProfilePreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 3.4 Data Export Entity

```typescript
@Entity('data_exports')
export class DataExport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: ['json', 'csv', 'pdf'], default: 'json' })
  format: 'json' | 'csv' | 'pdf';

  @Column({ type: 'enum', enum: ['all', 'tasks', 'projects', 'time-blocks'], default: 'all' })
  dataType: 'all' | 'tasks' | 'projects' | 'time-blocks';

  @Column({ nullable: true })
  fileName: string;

  @Column({ type: 'timestamp', nullable: true })
  exportedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## 4. API Endpoints

### 4.1 Theme Preferences

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings/theme` | Get user's theme preferences |
| PUT | `/settings/theme` | Update user's theme preferences |

### 4.2 Timezone Preferences

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings/timezone` | Get user's timezone preferences |
| PUT | `/settings/timezone` | Update user's timezone preferences |

### 4.3 Notification Preferences

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings/notifications` | Get user's notification preferences |
| PUT | `/settings/notifications` | Update user's notification preferences |

### 4.4 Profile Preferences

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings/profile` | Get user's profile information |
| PUT | `/settings/profile` | Update user's profile information |
| POST | `/settings/profile/avatar` | Upload user's avatar |

### 4.5 Data Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/settings/export` | Initiate data export |
| GET | `/settings/export/:id` | Get export status |
| GET | `/settings/export/:id/download` | Download exported data |

## 5. DTOs

### 5.1 Theme Preference DTOs

```typescript
// ThemePreferenceDto
export class ThemePreferenceDto {
  @IsOptional()
  @IsEnum(['light', 'dark', 'system'])
  theme?: 'light' | 'dark' | 'system';

  @IsOptional()
  @IsString()
  accentColor?: string;

  @IsOptional()
  @IsBoolean()
  highContrastMode?: boolean;
}

// ThemePreferenceResponseDto
export class ThemePreferenceResponseDto {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  highContrastMode: boolean;
  updatedAt: Date;
}
```

### 5.2 Timezone Preference DTOs

```typescript
// TimezonePreferenceDto
export class TimezonePreferenceDto {
  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  autoDetect?: boolean;
}

// TimezonePreferenceResponseDto
export class TimezonePreferenceResponseDto {
  timezone: string;
  autoDetect: boolean;
  updatedAt: Date;
}
```

### 5.3 Profile Preference DTOs

```typescript
// ProfilePreferenceDto
export class ProfilePreferenceDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;
}

// ProfilePreferenceResponseDto
export class ProfilePreferenceResponseDto {
  firstName: string;
  lastName: string;
  avatarUrl: string;
  updatedAt: Date;
}
```

### 5.4 Data Export DTOs

```typescript
// DataExportDto
export class DataExportDto {
  @IsEnum(['json', 'csv', 'pdf'])
  format: 'json' | 'csv' | 'pdf';

  @IsEnum(['all', 'tasks', 'projects', 'time-blocks'])
  dataType: 'all' | 'tasks' | 'projects' | 'time-blocks';
}

// DataExportResponseDto
export class DataExportResponseDto {
  id: string;
  format: 'json' | 'csv' | 'pdf';
  dataType: 'all' | 'tasks' | 'projects' | 'time-blocks';
  fileName: string;
  exportedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}
```

## 6. Business Logic

### 6.1 Theme Customization

The theme customization feature will:
1. Allow users to select between light, dark, or system-based themes
2. Enable accent color customization
3. Support high contrast mode for accessibility
4. Persist preferences in the database
5. Apply preferences immediately in the UI

**Test Cases:**
- Light theme selection
- Dark theme selection
- Accent color customization
- Preference persistence
- System preference integration
- High contrast mode

**Edge Cases:**
- Theme storage failures
- Concurrent theme changes
- Browser compatibility
- Accessibility compliance
- Performance impact
- Default fallback

### 6.2 Timezone Configuration

The timezone configuration feature will:
1. Provide a dropdown of standard timezones
2. Support automatic timezone detection
3. Allow manual timezone override
4. Update all time displays in the application
5. Handle timezone transitions correctly

**Test Cases:**
- Timezone dropdown selection
- Time display updates
- Global time formatting
- Browser detection
- Manual override

**Edge Cases:**
- Invalid timezone selection
- Time zone transitions
- System time changes
- Concurrent updates
- Edge case timezones
- Default handling

### 6.3 Notification Settings

The notification settings feature will:
1. Allow enabling/disabling different notification channels (email, push, in-app)
2. Configure quiet hours to suppress notifications
3. Select which notification types to receive
4. Send test notifications to verify settings
5. Persist preferences in the database

**Test Cases:**
- Notification type controls
- Channel selection
- Quiet hours setup
- Preference application
- Test notification

**Edge Cases:**
- Conflicting settings
- Edge case times
- Storage failures
- Concurrent changes
- Default handling
- Test delivery failures

### 6.4 Profile Management

The profile management feature will:
1. Allow updating first name and last name
2. Support avatar upload with validation
3. Implement file size and format restrictions
4. Store avatar files securely
5. Update user information in the database

**Test Cases:**
- Name updates
- Timezone updates
- Avatar upload
- Change persistence
- Input validation
- Confirmation messages

**Edge Cases:**
- Invalid input data
- Large avatar files
- Unsupported formats
- Network interruptions
- Concurrent updates
- Storage failures

### 6.5 Data Export

The data export feature will:
1. Support multiple export formats (JSON, CSV, PDF)
2. Allow selection of data types to export
3. Generate export files asynchronously
4. Provide download links for completed exports
5. Clean up old export files periodically

**Test Cases:**
- JSON format export
- Data type selection
- Complete data inclusion
- File formatting
- Export confirmation

**Edge Cases:**
- Large data exports
- Export interruptions
- Storage limitations
- Format validation
- Concurrent exports
- Data corruption

## 7. Frontend Components

### 7.1 Settings Page Structure

The settings page will be organized into sections:
- Theme Preferences
- Timezone Configuration
- Notification Settings
- Profile Management
- Data Export

### 7.2 Component Hierarchy

```
SettingsPage
├── ThemeSettings
│   ├── ThemeSelector
│   ├── ColorPicker
│   └── ContrastToggle
├── TimezoneSettings
│   ├── TimezoneSelector
│   └── AutoDetectToggle
├── NotificationSettings
│   ├── ChannelPreferences
│   ├── QuietHoursSettings
│   └── NotificationTypeSelector
├── ProfileSettings
│   ├── NameInputs
│   ├── AvatarUploader
│   └── ProfileForm
└── DataExportSettings
    ├── FormatSelector
    ├── DataTypeSelector
    └── ExportButton
```

## 8. Testing Strategy

### 8.1 Unit Tests

- Test theme preference service methods
- Test timezone preference service methods
- Test notification preference service methods
- Test profile preference service methods
- Test data export service methods
- Validate DTOs with various input combinations

### 8.2 Integration Tests

- Test theme preference API endpoints
- Test timezone preference API endpoints
- Test notification preference API endpoints
- Test profile preference API endpoints
- Test data export API endpoints
- Verify authentication requirements for all endpoints

### 8.3 End-to-End Tests

- Test complete theme customization flow
- Test timezone configuration flow
- Test notification settings flow
- Test profile update flow
- Test data export flow
- Verify UI updates when settings change

## 9. Security Considerations

### 9.1 Authentication

All settings endpoints will be protected by JWT authentication using the existing `JwtAuthGuard`.

### 9.2 Authorization

Users will only be able to access and modify their own settings.

### 9.3 Data Validation

All input data will be validated using class-validator decorators to prevent injection attacks.

### 9.4 File Upload Security

Avatar uploads will be restricted to specific file types and sizes to prevent malicious file uploads.

## 10. Performance Considerations

### 10.1 Caching

Theme and timezone preferences will be cached to reduce database queries.

### 10.2 Asynchronous Processing

Data exports will be processed asynchronously to avoid blocking the main thread.

### 10.3 Database Indexing

Appropriate indexes will be added to settings entities for efficient querying.