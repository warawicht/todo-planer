# Project Management API Documentation

This document describes the API endpoints for managing projects in the To-Do List and Time Planner application.

## Authentication

All endpoints require a valid JWT token to be included in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Create a Project

**POST** `/projects`

Create a new project.

#### Request Body

```json
{
  "name": "string (1-100 characters, required)",
  "description": "string (0-1000 characters, optional)",
  "color": "hex color code (optional, e.g., #FF5733)"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "UUID",
    "name": "string",
    "description": "string",
    "color": "hex color code",
    "isArchived": false,
    "userId": "UUID",
    "createdAt": "ISO 8601 date string",
    "updatedAt": "ISO 8601 date string"
  },
  "message": "Project created successfully"
}
```

### Get All Projects

**GET** `/projects`

Retrieve all projects with optional filtering and pagination.

#### Query Parameters

- `isArchived` (boolean, optional) - Filter by archived status
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10, max: 100) - Number of items per page

#### Response

```json
{
  "data": [
    {
      "id": "UUID",
      "name": "string",
      "description": "string",
      "color": "hex color code",
      "isArchived": false,
      "userId": "UUID",
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Get a Specific Project

**GET** `/projects/:id`

Retrieve a specific project by ID.

#### Response

```json
{
  "success": true,
  "data": {
    "id": "UUID",
    "name": "string",
    "description": "string",
    "color": "hex color code",
    "isArchived": false,
    "userId": "UUID",
    "tasks": [
      {
        "id": "UUID",
        "title": "string",
        "description": "string",
        "dueDate": "ISO 8601 date string",
        "priority": 0,
        "status": "pending",
        "projectId": "UUID",
        "userId": "UUID",
        "createdAt": "ISO 8601 date string",
        "updatedAt": "ISO 8601 date string"
      }
    ],
    "createdAt": "ISO 8601 date string",
    "updatedAt": "ISO 8601 date string"
  }
}
```

### Update a Project

**PUT** `/projects/:id`

Update an existing project.

#### Request Body

```json
{
  "name": "string (1-100 characters, optional)",
  "description": "string (0-1000 characters, optional)",
  "color": "hex color code (optional)",
  "isArchived": "boolean (optional)"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "UUID",
    "name": "string",
    "description": "string",
    "color": "hex color code",
    "isArchived": false,
    "userId": "UUID",
    "createdAt": "ISO 8601 date string",
    "updatedAt": "ISO 8601 date string"
  },
  "message": "Project updated successfully"
}
```

### Delete a Project

**DELETE** `/projects/:id`

Delete a project. Tasks associated with the project will have their projectId set to NULL.

#### Response

```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### Assign Task to Project

**PUT** `/projects/:id/tasks/:taskId`

Assign a task to a project.

#### Response

```json
{
  "success": true,
  "data": {
    "id": "UUID",
    "title": "string",
    "description": "string",
    "dueDate": "ISO 8601 date string",
    "priority": 0,
    "status": "pending",
    "projectId": "UUID",
    "userId": "UUID",
    "createdAt": "ISO 8601 date string",
    "updatedAt": "ISO 8601 date string"
  },
  "message": "Task assigned to project successfully"
}
```

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request** - Validation errors
- **401 Unauthorized** - Missing or invalid JWT token
- **403 Forbidden** - Project or task not owned by user
- **404 Not Found** - Project or task not found
- **500 Internal Server Error** - Server-side errors