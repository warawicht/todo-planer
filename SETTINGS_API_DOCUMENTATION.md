# Settings API Documentation

This document provides detailed information about the Settings API endpoints implemented in the Todo Planer application.

## Authentication

All settings endpoints require authentication using JWT tokens. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Theme Preferences

### Get Theme Preferences

**Endpoint:** `GET /settings/theme`

**Description:** Retrieve the current theme preferences for the authenticated user.

**Response:**
```json
{
  "id": "uuid",
  "theme": "light|dark|system",
  "accentColor": "#4a76d4",
  "highContrastMode": false
}
```

### Update Theme Preferences

**Endpoint:** `PUT /settings/theme`

**Description:** Update theme preferences for the authenticated user.

**Request Body:**
```json
{
  "theme": "light|dark|system",
  "accentColor": "#hex-color",
  "highContrastMode": true|false
}
```

**Response:**
```json
{
  "id": "uuid",
  "theme": "light|dark|system",
  "accentColor": "#hex-color",
  "highContrastMode": true|false
}
```

## Timezone Preferences

### Get Timezone Preferences

**Endpoint:** `GET /settings/timezone`

**Description:** Retrieve the current timezone preferences for the authenticated user.

**Response:**
```json
{
  "id": "uuid",
  "timezone": "UTC",
  "autoDetect": true
}
```

### Update Timezone Preferences

**Endpoint:** `PUT /settings/timezone`

**Description:** Update timezone preferences for the authenticated user.

**Request Body:**
```json
{
  "timezone": "Timezone identifier (e.g., America/New_York)",
  "autoDetect": true|false
}
```

**Response:**
```json
{
  "id": "uuid",
  "timezone": "Timezone identifier",
  "autoDetect": true|false
}
```

## Profile Preferences

### Get Profile Preferences

**Endpoint:** `GET /settings/profile`

**Description:** Retrieve the current profile preferences for the authenticated user.

**Response:**
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

### Update Profile Preferences

**Endpoint:** `PUT /settings/profile`

**Description:** Update profile preferences for the authenticated user.

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "avatarUrl": "string"
}
```

### Upload Profile Avatar

**Endpoint:** `POST /settings/profile/avatar`

**Description:** Upload a new avatar for the authenticated user.

**Request:** Multipart form data with file field named `avatar`.

**Response:**
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "avatarUrl": "string"
}
```

## Data Export

### Create Data Export Request

**Endpoint:** `POST /settings/export`

**Description:** Initiate a data export request for the authenticated user.

**Request Body:**
```json
{
  "format": "json|csv|pdf",
  "dataType": "all|tasks|projects|time-blocks"
}
```

**Response:**
```json
{
  "id": "uuid",
  "format": "json|csv|pdf",
  "dataType": "all|tasks|projects|time-blocks",
  "fileName": "string|null",
  "exportedAt": "ISO timestamp|null",
  "status": "pending|processing|completed|failed"
}
```

### Get Data Export Status

**Endpoint:** `GET /settings/export/:id`

**Description:** Retrieve the status of a data export request.

**Response:**
```json
{
  "id": "uuid",
  "format": "json|csv|pdf",
  "dataType": "all|tasks|projects|time-blocks",
  "fileName": "string|null",
  "exportedAt": "ISO timestamp|null",
  "status": "pending|processing|completed|failed"
}
```

### Download Data Export

**Endpoint:** `GET /settings/export/:id/download`

**Description:** Download the exported data file.

**Response:** File download with appropriate content-type header.

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "error": "Bad Request",
  "statusCode": 400
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### 404 Not Found
```json
{
  "message": "Resource not found",
  "error": "Not Found",
  "statusCode": 404
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error",
  "error": "Internal Server Error",
  "statusCode": 500
}
```