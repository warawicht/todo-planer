# Collaboration API Documentation

This document provides detailed information about the Collaboration API endpoints for the todo-planer application.

## Table of Contents
1. [Task Sharing API](#task-sharing-api)
2. [Task Assignment API](#task-assignment-api)
3. [Comment API](#comment-api)
4. [Availability API](#availability-api)
5. [Calendar API](#calendar-api)

## Task Sharing API

### Share Task with User
```
POST /api/tasks/:taskId/share
```

**Request Body**:
```json
{
  "sharedWithId": "uuid",
  "permissionLevel": "view|edit|manage"
}
```

**Response**:
- `201 Created`: Task shared successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have permission to share task
- `404 Not Found`: Task not found
- `409 Conflict`: Task already shared with user

### Get Shared Tasks
```
GET /api/tasks/shared
```

**Query Parameters**:
- `permissionLevel`: Filter by permission level (view, edit, manage)
- `status`: Filter by acceptance status (pending, accepted, revoked)
- `page`: Page number for pagination (default: 1)
- `limit`: Number of items per page (default: 10, max: 100)

**Response**:
- `200 OK`: Returns array of shared tasks
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Missing or invalid authentication token

### Update Share Permission
```
PUT /api/tasks/share/:shareId
```

**Request Body**:
```json
{
  "permissionLevel": "view|edit|manage"
}
```

**Response**:
- `200 OK`: Share updated successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have permission to update share
- `404 Not Found`: Share not found

### Revoke Task Share
```
DELETE /api/tasks/share/:shareId
```

**Response**:
- `204 No Content`: Share revoked successfully
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have permission to revoke share
- `404 Not Found`: Share not found

### Accept Task Share
```
POST /api/tasks/share/:shareId/accept
```

**Response**:
- `200 OK`: Share accepted successfully
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have permission to accept share
- `404 Not Found`: Share not found
- `409 Conflict`: Share already accepted

## Task Assignment API

### Assign Task to User
```
POST /api/tasks/:taskId/assign
```

**Request Body**:
```json
{
  "assignedToId": "uuid"
}
```

**Response**:
- `201 Created`: Task assigned successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have permission to assign task
- `404 Not Found`: Task not found
- `409 Conflict`: Task already assigned to user

### Get Assigned Tasks
```
GET /api/tasks/assigned
```

**Query Parameters**:
- `status`: Filter by assignment status (pending, accepted, rejected, completed)
- `page`: Page number for pagination (default: 1)
- `limit`: Number of items per page (default: 10, max: 100)

**Response**:
- `200 OK`: Returns array of assigned tasks
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Missing or invalid authentication token

### Update Assignment Status
```
PUT /api/tasks/assignment/:assignmentId/status
```

**Request Body**:
```json
{
  "status": "accepted|rejected|completed"
}
```

**Response**:
- `200 OK`: Assignment status updated successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have permission to update assignment
- `404 Not Found`: Assignment not found
- `409 Conflict`: Invalid status transition

## Comment API

### Add Comment to Task
```
POST /api/tasks/:taskId/comments
```

**Request Body**:
```json
{
  "content": "string (1-2000 characters)",
  "parentId": "uuid (optional, for replies)"
}
```

**Response**:
- `201 Created`: Comment added successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Task not found

### Get Comments for Task
```
GET /api/tasks/:taskId/comments
```

**Response**:
- `200 OK`: Returns array of comments for the task
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Task not found

### Update Comment
```
PUT /api/tasks/comments/:commentId
```

**Request Body**:
```json
{
  "content": "string (1-2000 characters)"
}
```

**Response**:
- `200 OK`: Comment updated successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have permission to update comment
- `404 Not Found`: Comment not found

### Delete Comment
```
DELETE /api/tasks/comments/:commentId
```

**Response**:
- `204 No Content`: Comment deleted successfully
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have permission to delete comment
- `404 Not Found`: Comment not found

## Availability API

### Set User Availability
```
POST /api/availability
```

**Request Body**:
```json
{
  "startTime": "ISO8601 timestamp",
  "endTime": "ISO8601 timestamp",
  "status": "available|busy|away|offline",
  "note": "string (optional, 0-500 characters)"
}
```

**Response**:
- `201 Created`: Availability record created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token

### Get User Availability
```
GET /api/availability
```

**Response**:
- `200 OK`: Returns array of user's availability records
- `401 Unauthorized`: Missing or invalid authentication token

### Get Team Availability
```
GET /api/availability/team
```

**Query Parameters**:
- `userIds`: Array of user IDs to get availability for

**Response**:
- `200 OK`: Returns array of team members' availability records
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Missing or invalid authentication token

### Update Availability
```
PUT /api/availability/:availabilityId
```

**Request Body**:
```json
{
  "startTime": "ISO8601 timestamp (optional)",
  "endTime": "ISO8601 timestamp (optional)",
  "status": "available|busy|away|offline (optional)",
  "note": "string (optional, 0-500 characters)"
}
```

**Response**:
- `200 OK`: Availability record updated successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have permission to update availability record
- `404 Not Found`: Availability record not found

### Delete Availability
```
DELETE /api/availability/:availabilityId
```

**Response**:
- `204 No Content`: Availability record deleted successfully
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have permission to delete availability record
- `404 Not Found`: Availability record not found

## Calendar API

### Get Team Calendar
```
GET /api/calendar/team
```

**Query Parameters**:
- `startDate`: ISO8601 timestamp (optional)
- `endDate`: ISO8601 timestamp (optional)
- `userIds`: Array of user IDs to get calendar data for (optional, defaults to current user)

**Response**:
- `200 OK`: Returns team calendar data including time blocks and availability
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: One or more users not found

### Get User Calendar
```
GET /api/calendar/user/:userId
```

**Query Parameters**:
- `startDate`: ISO8601 timestamp (optional)
- `endDate`: ISO8601 timestamp (optional)

**Response**:
- `200 OK`: Returns user calendar data including time blocks and availability
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: User not found

### Get My Calendar
```
GET /api/calendar/me
```

**Query Parameters**:
- `startDate`: ISO8601 timestamp (optional)
- `endDate`: ISO8601 timestamp (optional)

**Response**:
- `200 OK`: Returns current user's calendar data including time blocks and availability
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Missing or invalid authentication token