# File Attachment API Documentation

## Overview

This document describes the API endpoints for managing file attachments within the To-Do List and Time Planner application. File attachments allow users to associate files with their tasks for better organization and reference.

## Base URL

All endpoints are relative to the base URL: `/api`

## Authentication

All file attachment endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## File Attachment Endpoints

### Upload a File Attachment

Upload a file and associate it with a task.

**Endpoint**: `POST /tasks/:id/attachments`

**Path Parameters**:
- `id` (string, required): The ID of the task to attach the file to

**Request Body**:
Multipart form data with a file field named `file`

**File Requirements**:
- Maximum file size: 10MB
- Supported file types:
  - Images: JPEG, PNG, GIF
  - Documents: PDF, TXT, DOC, DOCX, XLS, XLSX

**Response**:
- `201 Created`: File uploaded and attachment created successfully
- `400 Bad Request`: Invalid request data or file
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Task not found
- `413 Payload Too Large`: File exceeds size limit

**Example Request**:
```bash
curl -X POST /api/tasks/12345/attachments \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@/path/to/document.pdf"
```

**Example Response**:
```json
{
  "id": "67890",
  "fileName": "uuid-filename.pdf",
  "originalName": "document.pdf",
  "mimeType": "application/pdf",
  "fileSize": 102400,
  "uploadedAt": "2023-01-01T00:00:00.000Z",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "taskId": "12345",
  "userId": "user-id"
}
```

### List All Attachments

Retrieve all file attachments for a specific task.

**Endpoint**: `GET /tasks/:id/attachments`

**Path Parameters**:
- `id` (string, required): The ID of the task

**Response**:
- `200 OK`: Returns an array of file attachments
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Task not found

**Example Request**:
```bash
curl -X GET /api/tasks/12345/attachments \
  -H "Authorization: Bearer <access_token>"
```

**Example Response**:
```json
[
  {
    "id": "67890",
    "fileName": "uuid-filename.pdf",
    "originalName": "document.pdf",
    "mimeType": "application/pdf",
    "fileSize": 102400,
    "uploadedAt": "2023-01-01T00:00:00.000Z",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "taskId": "12345",
    "userId": "user-id"
  }
]
```

### Download a File Attachment

Download a file attachment.

**Endpoint**: `GET /tasks/:id/attachments/:attachmentId`

**Path Parameters**:
- `id` (string, required): The ID of the task
- `attachmentId` (string, required): The ID of the attachment to download

**Response**:
- `200 OK`: File downloaded successfully
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Task or attachment not found

**Example Request**:
```bash
curl -X GET /api/tasks/12345/attachments/67890 \
  -H "Authorization: Bearer <access_token>" \
  -o downloaded-file.pdf
```

### Delete a File Attachment

Delete a file attachment. This will also delete the physical file from storage.

**Endpoint**: `DELETE /tasks/:id/attachments/:attachmentId`

**Path Parameters**:
- `id` (string, required): The ID of the task
- `attachmentId` (string, required): The ID of the attachment to delete

**Response**:
- `200 OK`: Attachment deleted successfully
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Task or attachment not found

**Example Request**:
```bash
curl -X DELETE /api/tasks/12345/attachments/67890 \
  -H "Authorization: Bearer <access_token>"
```

**Example Response**:
```json
{
  "message": "Attachment deleted successfully"
}
```

## Data Models

### File Attachment Object

| Property | Type | Description |
|----------|------|-------------|
| id | string (UUID) | Unique identifier for the attachment |
| fileName | string | Unique filename used for storage |
| originalName | string | Original filename when uploaded |
| mimeType | string | MIME type of the file |
| fileSize | integer | Size of the file in bytes |
| uploadedAt | string (ISO 8601) | Timestamp when file was uploaded |
| createdAt | string (ISO 8601) | Timestamp when attachment record was created |
| updatedAt | string (ISO 8601) | Timestamp when attachment record was last updated |
| taskId | string (UUID) | ID of the task the file is attached to |
| userId | string (UUID) | ID of the user who uploaded the file |

## Security Considerations

1. **File Type Validation**: Only specific file types are allowed to prevent malicious uploads
2. **File Size Limits**: Maximum file size is limited to 10MB to prevent storage abuse
3. **Ownership Verification**: Users can only access files they have uploaded
4. **Secure Storage**: Files are stored outside the web root with unique filenames
5. **Authentication**: All endpoints require valid JWT authentication

## Error Responses

All endpoints may return the following error responses:

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not have permission to access the resource
- `404 Not Found`: Requested resource not found
- `413 Payload Too Large`: File exceeds size limit
- `500 Internal Server Error`: Unexpected server error

Error response format:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```