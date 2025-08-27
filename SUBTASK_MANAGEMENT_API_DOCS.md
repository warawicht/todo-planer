# Subtask Management API Documentation

## Overview

This document describes the API endpoints for managing subtasks within the To-Do List and Time Planner application. Subtasks allow users to break down complex tasks into smaller, manageable components while maintaining a hierarchical relationship with their parent tasks.

## Base URL

All endpoints are relative to the base URL: `/api`

## Authentication

All subtask endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Subtask Endpoints

### Create a Subtask

Create a new subtask under a parent task.

**Endpoint**: `POST /tasks/:id/subtasks`

**Path Parameters**:
- `id` (string, required): The ID of the parent task

**Request Body**:
```json
{
  "title": "string (1-200 characters, required)",
  "description": "string (0-2000 characters, optional)",
  "dueDate": "ISO 8601 date string (optional)",
  "priority": "integer (0-4, optional, default: 0)",
  "position": "integer (optional)"
}
```

**Response**:
- `201 Created`: Subtask created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Parent task not found

**Example Request**:
```bash
curl -X POST /api/tasks/12345/subtasks \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement user authentication",
    "description": "Create login and registration functionality",
    "priority": 2
  }'
```

**Example Response**:
```json
{
  "id": "67890",
  "title": "Implement user authentication",
  "description": "Create login and registration functionality",
  "dueDate": null,
  "priority": 2,
  "status": "pending",
  "completedAt": null,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "parentId": "12345",
  "position": 0
}
```

### Get All Subtasks

Retrieve all subtasks for a specific parent task.

**Endpoint**: `GET /tasks/:id/subtasks`

**Path Parameters**:
- `id` (string, required): The ID of the parent task

**Response**:
- `200 OK`: Returns an array of subtasks
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Parent task not found

**Example Request**:
```bash
curl -X GET /api/tasks/12345/subtasks \
  -H "Authorization: Bearer <access_token>"
```

**Example Response**:
```json
[
  {
    "id": "67890",
    "title": "Implement user authentication",
    "description": "Create login and registration functionality",
    "dueDate": null,
    "priority": 2,
    "status": "pending",
    "completedAt": null,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "parentId": "12345",
    "position": 0
  }
]
```

### Update a Subtask

Update an existing subtask.

**Endpoint**: `PUT /tasks/:id/subtasks/:subtaskId`

**Path Parameters**:
- `id` (string, required): The ID of the parent task
- `subtaskId` (string, required): The ID of the subtask to update

**Request Body**:
```json
{
  "title": "string (1-200 characters, optional)",
  "description": "string (0-2000 characters, optional)",
  "dueDate": "ISO 8601 date string (optional)",
  "priority": "integer (0-4, optional)",
  "position": "integer (optional)",
  "status": "string (pending, in-progress, completed, cancelled, optional)"
}
```

**Response**:
- `200 OK`: Subtask updated successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Parent task or subtask not found

**Example Request**:
```bash
curl -X PUT /api/tasks/12345/subtasks/67890 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement user authentication and authorization",
    "priority": 3
  }'
```

**Example Response**:
```json
{
  "id": "67890",
  "title": "Implement user authentication and authorization",
  "description": "Create login and registration functionality",
  "dueDate": null,
  "priority": 3,
  "status": "pending",
  "completedAt": null,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z",
  "parentId": "12345",
  "position": 0
}
```

### Delete a Subtask

Delete a subtask.

**Endpoint**: `DELETE /tasks/:id/subtasks/:subtaskId`

**Path Parameters**:
- `id` (string, required): The ID of the parent task
- `subtaskId` (string, required): The ID of the subtask to delete

**Response**:
- `200 OK`: Subtask deleted successfully
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Parent task or subtask not found

**Example Request**:
```bash
curl -X DELETE /api/tasks/12345/subtasks/67890 \
  -H "Authorization: Bearer <access_token>"
```

**Example Response**:
```json
{
  "message": "Subtask deleted successfully"
}
```

### Reorder Subtasks

Reorder subtasks within a parent task.

**Endpoint**: `PUT /tasks/:id/subtasks/:subtaskId/move`

**Path Parameters**:
- `id` (string, required): The ID of the parent task
- `subtaskId` (string, required): The ID of the subtask to move

**Request Body**:
```json
{
  "position": "integer (required, 0-based index)"
}
```

**Response**:
- `200 OK`: Subtasks reordered successfully
- `400 Bad Request`: Invalid position value
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Parent task or subtask not found

**Example Request**:
```bash
curl -X PUT /api/tasks/12345/subtasks/67890/move \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "position": 2
  }'
```

**Example Response**:
```json
[
  {
    "id": "11111",
    "title": "First subtask",
    "position": 0
  },
  {
    "id": "22222",
    "title": "Second subtask",
    "position": 1
  },
  {
    "id": "67890",
    "title": "Moved subtask",
    "position": 2
  }
]
```

### Convert Subtask to Regular Task

Convert a subtask to a regular task by removing its parent relationship.

**Endpoint**: `POST /tasks/:id/subtasks/:subtaskId/convert`

**Path Parameters**:
- `id` (string, required): The ID of the parent task
- `subtaskId` (string, required): The ID of the subtask to convert

**Response**:
- `200 OK`: Subtask converted successfully
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Parent task or subtask not found

**Example Request**:
```bash
curl -X POST /api/tasks/12345/subtasks/67890/convert \
  -H "Authorization: Bearer <access_token>"
```

**Example Response**:
```json
{
  "id": "67890",
  "title": "Converted task",
  "parentId": null,
  "position": null
}
```

## Data Models

### Subtask Object

| Property | Type | Description |
|----------|------|-------------|
| id | string (UUID) | Unique identifier for the subtask |
| title | string | Title of the subtask (1-200 characters) |
| description | string | Description of the subtask (0-2000 characters) |
| dueDate | string (ISO 8601) | Due date for the subtask |
| priority | integer | Priority level (0-4) |
| status | string | Current status (pending, in-progress, completed, cancelled) |
| completedAt | string (ISO 8601) | Timestamp when task was completed |
| createdAt | string (ISO 8601) | Timestamp when task was created |
| updatedAt | string (ISO 8601) | Timestamp when task was last updated |
| parentId | string (UUID) | ID of the parent task |
| position | integer | Position within parent task's subtasks |
| userId | string (UUID) | ID of the user who owns the task |
| projectId | string (UUID) | ID of the project the task belongs to (if any) |

## Status Transitions

Subtasks follow the same status transition rules as regular tasks:

1. `pending` → `in-progress` → `completed`
2. `pending` → `cancelled`
3. `in-progress` → `cancelled`
4. `completed` → `pending` (reopening)
5. `cancelled` → `pending` (reopening)

## Error Responses

All endpoints may return the following error responses:

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not have permission to access the resource
- `404 Not Found`: Requested resource not found
- `500 Internal Server Error`: Unexpected server error

Error response format:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```