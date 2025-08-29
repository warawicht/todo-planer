# Enterprise Feature API Documentation

This document outlines the API endpoints for the enterprise features implemented in the todo-planer application.

## Table of Contents
1. [Role Management](#role-management)
2. [Permission Management](#permission-management)
3. [User Management Dashboard](#user-management-dashboard)
4. [Activity Logging](#activity-logging)
5. [Workflow Engine](#workflow-engine)
6. [Audit Trail](#audit-trail)

## Role Management

### Create Role
```
POST /roles
```

**Request Body:**
```json
{
  "name": "admin",
  "description": "Administrator with full access",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "role": {
    "id": "uuid",
    "name": "admin",
    "description": "Administrator with full access",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
}
```

### Get All Roles
```
GET /roles
```

**Response:**
```json
{
  "success": true,
  "roles": [
    {
      "id": "uuid",
      "name": "admin",
      "description": "Administrator with full access",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ]
}
```

### Get Role by ID
```
GET /roles/:id
```

**Response:**
```json
{
  "success": true,
  "role": {
    "id": "uuid",
    "name": "admin",
    "description": "Administrator with full access",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z",
    "rolePermissions": [
      {
        "id": "uuid",
        "roleId": "uuid",
        "permissionId": "uuid",
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-01T00:00:00Z",
        "permission": {
          "id": "uuid",
          "name": "task:create",
          "description": "Create tasks",
          "resource": "task",
          "action": "create",
          "createdAt": "2023-01-01T00:00:00Z",
          "updatedAt": "2023-01-01T00:00:00Z"
        }
      }
    ]
  }
}
```

### Update Role
```
PUT /roles/:id
```

**Request Body:**
```json
{
  "name": "administrator",
  "description": "Full system administrator",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "role": {
    "id": "uuid",
    "name": "administrator",
    "description": "Full system administrator",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-02T00:00:00Z"
  }
}
```

### Delete Role
```
DELETE /roles/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

## Permission Management

### Create Permission
```
POST /permissions
```

**Request Body:**
```json
{
  "name": "task:create",
  "description": "Create tasks",
  "resource": "task",
  "action": "create"
}
```

**Response:**
```json
{
  "success": true,
  "permission": {
    "id": "uuid",
    "name": "task:create",
    "description": "Create tasks",
    "resource": "task",
    "action": "create",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
}
```

### Get All Permissions
```
GET /permissions
```

**Response:**
```json
{
  "success": true,
  "permissions": [
    {
      "id": "uuid",
      "name": "task:create",
      "description": "Create tasks",
      "resource": "task",
      "action": "create",
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ]
}
```

### Get Permission by ID
```
GET /permissions/:id
```

**Response:**
```json
{
  "success": true,
  "permission": {
    "id": "uuid",
    "name": "task:create",
    "description": "Create tasks",
    "resource": "task",
    "action": "create",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
}
```

### Update Permission
```
PUT /permissions/:id
```

**Request Body:**
```json
{
  "name": "task:create-updated",
  "description": "Create tasks with additional fields",
  "resource": "task",
  "action": "create"
}
```

**Response:**
```json
{
  "success": true,
  "permission": {
    "id": "uuid",
    "name": "task:create-updated",
    "description": "Create tasks with additional fields",
    "resource": "task",
    "action": "create",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-02T00:00:00Z"
  }
}
```

### Delete Permission
```
DELETE /permissions/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Permission deleted successfully"
}
```

### Assign Permission to Role
```
POST /permissions/:roleId/permissions
```

**Request Body:**
```json
{
  "permissionId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Permission assigned to role successfully"
}
```

### Remove Permission from Role
```
DELETE /permissions/:roleId/permissions/:permissionId
```

**Response:**
```json
{
  "success": true,
  "message": "Permission removed from role successfully"
}
```

## User Management Dashboard

### Get All Users
```
GET /users?limit=10&offset=0&status=active
```

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 10)
- `offset` (optional): Offset for pagination (default: 0)
- `status` (optional): Filter by status (active/inactive)

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

### Get User Roles
```
GET /users/:userId/roles
```

**Response:**
```json
{
  "success": true,
  "roles": [
    {
      "id": "uuid",
      "name": "admin",
      "description": "Administrator role",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ]
}
```

### Update User Status
```
PUT /users/:userId/status
```

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": false,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-02T00:00:00Z"
  }
}
```

### Assign Role to User
```
POST /users/:userId/roles
```

**Request Body:**
```json
{
  "roleId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role assigned to user successfully"
}
```

### Remove Role from User
```
DELETE /users/:userId/roles/:roleId
```

**Response:**
```json
{
  "success": true,
  "message": "Role removed from user successfully"
}
```

## Activity Logging

### Get User Activity Logs
```
GET /users/:userId/activity-logs?limit=50&offset=0
```

**Query Parameters:**
- `limit` (optional): Number of logs to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid",
      "userId": "uuid",
      "action": "POST /tasks",
      "metadata": {
        "method": "POST",
        "url": "/tasks",
        "statusCode": 201,
        "duration": 45,
        "userAgent": "Mozilla/5.0..."
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

### Get System Activity Logs
```
GET /activity-logs?limit=50&offset=0&userId=uuid&action=login
```

**Query Parameters:**
- `limit` (optional): Number of logs to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)
- `userId` (optional): Filter by user ID
- `action` (optional): Filter by action

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid",
      "userId": "uuid",
      "action": "login",
      "metadata": {
        "method": "POST",
        "url": "/auth/login",
        "statusCode": 200,
        "duration": 120,
        "userAgent": "Mozilla/5.0..."
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

### Export Activity Logs
```
GET /activity-logs/export?format=csv&startDate=2023-01-01&endDate=2023-01-31
```

**Query Parameters:**
- `format` (optional): Export format (csv/json, default: csv)
- `startDate` (optional): Start date for export
- `endDate` (optional): End date for export

**Response:**
```csv
ID,User ID,Action,Timestamp,IP Address,User Agent
uuid,uuid,login,2023-01-01T00:00:00.000Z,192.168.1.1,Mozilla/5.0...
```

## Workflow Engine

### Create Workflow
```
POST /workflows
```

**Request Body:**
```json
{
  "name": "Task Approval Workflow",
  "description": "Workflow for approving tasks",
  "steps": [
    {
      "name": "Manager Approval",
      "order": 1,
      "approvers": ["manager-role-id"],
      "requiredApprovals": 1
    }
  ],
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "workflow": {
    "id": "uuid",
    "name": "Task Approval Workflow",
    "description": "Workflow for approving tasks",
    "steps": [
      {
        "name": "Manager Approval",
        "order": 1,
        "approvers": ["manager-role-id"],
        "requiredApprovals": 1
      }
    ],
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
}
```

### Get All Workflows
```
GET /workflows
```

**Response:**
```json
{
  "success": true,
  "workflows": [
    {
      "id": "uuid",
      "name": "Task Approval Workflow",
      "description": "Workflow for approving tasks",
      "steps": [
        {
          "name": "Manager Approval",
          "order": 1,
          "approvers": ["manager-role-id"],
          "requiredApprovals": 1
        }
      ],
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ]
}
```

### Get Workflow by ID
```
GET /workflows/:id
```

**Response:**
```json
{
  "success": true,
  "workflow": {
    "id": "uuid",
    "name": "Task Approval Workflow",
    "description": "Workflow for approving tasks",
    "steps": [
      {
        "name": "Manager Approval",
        "order": 1,
        "approvers": ["manager-role-id"],
        "requiredApprovals": 1
      }
    ],
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
}
```

### Update Workflow
```
PUT /workflows/:id
```

**Request Body:**
```json
{
  "name": "Task Approval Workflow Updated",
  "description": "Updated workflow for approving tasks",
  "steps": [
    {
      "name": "Manager Approval",
      "order": 1,
      "approvers": ["manager-role-id"],
      "requiredApprovals": 1
    },
    {
      "name": "Director Approval",
      "order": 2,
      "approvers": ["director-role-id"],
      "requiredApprovals": 1
    }
  ],
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "workflow": {
    "id": "uuid",
    "name": "Task Approval Workflow Updated",
    "description": "Updated workflow for approving tasks",
    "steps": [
      {
        "name": "Manager Approval",
        "order": 1,
        "approvers": ["manager-role-id"],
        "requiredApprovals": 1
      },
      {
        "name": "Director Approval",
        "order": 2,
        "approvers": ["director-role-id"],
        "requiredApprovals": 1
      }
    ],
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-02T00:00:00Z"
  }
}
```

### Delete Workflow
```
DELETE /workflows/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Workflow deleted successfully"
}
```

### Create Workflow Instance
```
POST /workflows/:workflowId/instances
```

**Request Body:**
```json
{
  "resourceId": "task-uuid",
  "resourceType": "task"
}
```

**Response:**
```json
{
  "success": true,
  "instance": {
    "id": "uuid",
    "workflowId": "workflow-uuid",
    "resourceId": "task-uuid",
    "resourceType": "task",
    "status": "pending",
    "currentStep": {
      "name": "Manager Approval",
      "order": 1,
      "approvers": ["manager-role-id"],
      "requiredApprovals": 1
    },
    "approvalHistory": [],
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
}
```

### Get Workflow Instances
```
GET /workflows/:workflowId/instances
```

**Response:**
```json
{
  "success": true,
  "instances": [
    {
      "id": "uuid",
      "workflowId": "workflow-uuid",
      "resourceId": "task-uuid",
      "resourceType": "task",
      "status": "pending",
      "currentStep": {
        "name": "Manager Approval",
        "order": 1,
        "approvers": ["manager-role-id"],
        "requiredApprovals": 1
      },
      "approvalHistory": [],
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ]
}
```

### Approve Workflow Step
```
POST /workflow-instances/:instanceId/approve
```

**Request Body:**
```json
{
  "userId": "approver-uuid",
  "action": "approved",
  "comments": "Looks good to me"
}
```

**Response:**
```json
{
  "success": true,
  "instance": {
    "id": "uuid",
    "workflowId": "workflow-uuid",
    "resourceId": "task-uuid",
    "resourceType": "task",
    "status": "completed",
    "currentStep": {
      "name": "Manager Approval",
      "order": 1,
      "approvers": ["manager-role-id"],
      "requiredApprovals": 1
    },
    "approvalHistory": [
      {
        "userId": "approver-uuid",
        "action": "approved",
        "timestamp": "2023-01-01T00:00:00Z",
        "comments": "Looks good to me"
      }
    ],
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
}
```

### Reject Workflow Step
```
POST /workflow-instances/:instanceId/reject
```

**Request Body:**
```json
{
  "userId": "approver-uuid",
  "action": "rejected",
  "comments": "Needs more work"
}
```

**Response:**
```json
{
  "success": true,
  "instance": {
    "id": "uuid",
    "workflowId": "workflow-uuid",
    "resourceId": "task-uuid",
    "resourceType": "task",
    "status": "rejected",
    "currentStep": {
      "name": "Manager Approval",
      "order": 1,
      "approvers": ["manager-role-id"],
      "requiredApprovals": 1
    },
    "approvalHistory": [
      {
        "userId": "approver-uuid",
        "action": "rejected",
        "timestamp": "2023-01-01T00:00:00Z",
        "comments": "Needs more work"
      }
    ],
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
}
```

## Audit Trail

### Get User Audit Trail
```
GET /users/:userId/audit-trail?limit=50&offset=0
```

**Query Parameters:**
- `limit` (optional): Number of audit trails to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "auditTrails": [
    {
      "id": "uuid",
      "userId": "uuid",
      "action": "update",
      "resourceType": "task",
      "resourceId": "task-uuid",
      "beforeState": {
        "title": "Old Task Title"
      },
      "afterState": {
        "title": "New Task Title"
      },
      "ipAddress": "192.168.1.1",
      "timestamp": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

### Get Audit Trail Entries
```
GET /audit-trail?resourceType=task&resourceId=uuid
```

**Query Parameters:**
- `resourceType` (optional): Filter by resource type
- `resourceId` (optional): Filter by resource ID
- `userId` (optional): Filter by user ID
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `limit` (optional): Number of audit trails to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "auditTrails": [
    {
      "id": "uuid",
      "userId": "uuid",
      "action": "update",
      "resourceType": "task",
      "resourceId": "task-uuid",
      "beforeState": {
        "title": "Old Task Title"
      },
      "afterState": {
        "title": "New Task Title"
      },
      "ipAddress": "192.168.1.1",
      "timestamp": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

### Export Audit Trail
```
GET /audit-trail/export?format=csv&startDate=2023-01-01&endDate=2023-01-31
```

**Query Parameters:**
- `format` (optional): Export format (csv/json, default: csv)
- `startDate` (optional): Start date for export
- `endDate` (optional): End date for export

**Response:**
```csv
ID,User ID,Action,Resource Type,Resource ID,Timestamp,IP Address
uuid,uuid,update,task,task-uuid,2023-01-01T00:00:00.000Z,192.168.1.1
```