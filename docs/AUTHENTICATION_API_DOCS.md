# Authentication API Documentation

This document provides detailed information about the authentication endpoints implemented in the system.

## Base URL

All endpoints are prefixed with `/auth`.

## Authentication Endpoints

### 1. User Registration

**Endpoint**: `POST /auth/register`

**Description**: Registers a new user account with email verification.

**Request Body**:
```json
{
  "email": "string (required, valid email format)",
  "password": "string (required, minimum 8 characters with mixed case, numbers, and special characters)",
  "firstName": "string (optional)",
  "lastName": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string or null",
    "lastName": "string or null"
  }
}
```

**Error Responses**:
- 400 Bad Request: Invalid input data or user already exists
- 500 Internal Server Error: Registration failed

### 2. Email Verification

**Endpoint**: `GET /auth/verify-email`

**Description**: Verifies a user's email address using a token sent via email.

**Query Parameters**:
```
token: string (required, email verification token)
```

**Response**:
```json
{
  "success": true,
  "message": "Email verified successfully",
  "user": {
    "id": "uuid",
    "email": "string",
    "isEmailVerified": true
  }
}
```

**Error Responses**:
- 400 Bad Request: Invalid or expired verification token

### 3. User Login

**Endpoint**: `POST /auth/login`

**Description**: Authenticates a user and returns access and refresh tokens.

**Request Body**:
```json
{
  "email": "string (required, valid email format)",
  "password": "string (required)"
}
```

**Response**:
```json
{
  "success": true,
  "accessToken": "JWT access token (15 minutes expiration)",
  "refreshToken": "Refresh token (30 days expiration)",
  "user": {
    "email": "string"
  }
}
```

**Cookies**:
- `refreshToken`: HTTP-only cookie containing the refresh token

**Error Responses**:
- 401 Unauthorized: Invalid credentials
- 401 Unauthorized: Account is locked
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Login failed

### 4. Forgot Password

**Endpoint**: `POST /auth/forgot-password`

**Description**: Initiates the password reset process by sending a reset link to the user's email.

**Request Body**:
```json
{
  "email": "string (required, valid email format)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "If your email exists in our system, you will receive a password reset link."
}
```

**Note**: The response is the same regardless of whether the email exists to prevent email enumeration attacks.

**Error Responses**:
- 429 Too Many Requests: Rate limit exceeded

### 5. Reset Password

**Endpoint**: `POST /auth/reset-password`

**Description**: Resets a user's password using a token received via email.

**Request Body**:
```json
{
  "token": "string (required, password reset token)",
  "newPassword": "string (required, minimum 8 characters with mixed case, numbers, and special characters)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses**:
- 400 Bad Request: Invalid or expired reset token
- 400 Bad Request: Password does not meet strength requirements

### 6. User Logout

**Endpoint**: `POST /auth/logout`

**Description**: Logs out the user and invalidates their refresh token.

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "refreshToken": "string (optional, used for testing)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Cookies**:
- Clears the `refreshToken` cookie

**Error Responses**:
- 401 Unauthorized: Invalid access token

### 7. Token Refresh

**Endpoint**: `POST /auth/refresh`

**Description**: Refreshes the access token using a valid refresh token.

**Cookies**:
```
refreshToken: HTTP-only cookie containing the refresh token
```

**Response**:
```json
{
  "success": true,
  "accessToken": "New JWT access token (15 minutes expiration)"
}
```

**Cookies**:
- Sets a new `refreshToken` cookie with the updated refresh token

**Error Responses**:
- 400 Bad Request: Refresh token not provided
- 401 Unauthorized: Invalid refresh token
- 401 Unauthorized: Refresh token has expired
- 401 Unauthorized: Refresh token has been revoked

### 8. Get User Profile

**Endpoint**: `GET /auth/profile`

**Description**: Retrieves the authenticated user's profile information.

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string or null",
    "lastName": "string or null",
    "isEmailVerified": "boolean",
    "isActive": "boolean",
    "failedLoginAttempts": "number",
    "lockoutUntil": "date or null",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

**Error Responses**:
- 401 Unauthorized: Invalid access token

### 9. Update User Profile

**Endpoint**: `PUT /auth/profile`

**Description**: Updates the authenticated user's profile information.

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string or null",
    "lastName": "string or null"
  }
}
```

**Error Responses**:
- 401 Unauthorized: Invalid access token
- 400 Bad Request: Invalid input data

### 10. Unlock Account

**Endpoint**: `POST /auth/unlock-account/:userId`

**Description**: Unlocks a locked user account (admin functionality).

**Headers**:
```
Authorization: Bearer <access_token>
```

**Path Parameters**:
```
userId: uuid (required, ID of the user to unlock)
```

**Response**:
```json
{
  "success": true,
  "message": "Account unlocked successfully",
  "user": {
    "id": "uuid",
    "email": "string",
    "failedLoginAttempts": 0,
    "lockoutUntil": null
  }
}
```

**Error Responses**:
- 401 Unauthorized: Invalid access token
- 404 Not Found: User not found

## Security Features

### JWT Tokens
- **Access Tokens**: Short-lived (15 minutes), contain user ID and email
- **Refresh Tokens**: Long-lived (30 days), stored in HTTP-only cookies
- **Token Claims**:
  - `sub`: User ID
  - `email`: User email
  - `iat`: Issued at timestamp
  - `exp`: Expiration timestamp

### Security Headers
- `HttpOnly`: Prevents XSS attacks
- `Secure`: Only transmitted over HTTPS
- `SameSite`: Prevents CSRF attacks
- `Max-Age`: Token expiration time

### Rate Limiting
- 10 requests per minute for authentication endpoints (IP-based)
- 20 requests per minute for authenticated users (user-based)

### Account Protection
- Account lockout after 5 failed login attempts
- 30-minute lockout duration
- Admin unlock capability

## Error Responses

All endpoints follow standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error
</parameter_content>