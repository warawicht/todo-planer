# Authentication System Design

## 1. Overview

The Authentication System is a critical component of the To-Do List and Time Planner application, providing secure user registration, login, session management, and access control. This system implements industry-standard security practices including JWT-based authentication with refresh tokens, email verification, password reset functionality, and robust security measures to protect user accounts.

### 1.1 Objectives
- Secure user authentication and authorization
- Protection against common security vulnerabilities
- Seamless user experience with persistent sessions
- Compliance with security best practices and standards

### 1.2 Key Features
- User registration with email verification
- Secure login with JWT authentication
- Password reset functionality
- Session management with refresh tokens
- Rate limiting for authentication endpoints
- Account lockout after failed attempts
- Secure logout mechanism

## 2. Architecture

### 2.1 System Components

The system consists of the following components:

- Client Application: The frontend interface that users interact with
- Authentication API: The core service handling all authentication requests
- User Database: Storage for user account information
- Token Storage: Secure storage for refresh tokens
- Email Service: Service for sending verification and notification emails
- Security Middleware: Component responsible for security checks and validations
- Rate Limiter: Component that enforces rate limiting policies

### 2.2 Technology Stack
- **Framework**: NestJS (Node.js framework with TypeScript support)
- **Authentication**: JWT (JSON Web Tokens) with RS256 asymmetric encryption
- **Database**: PostgreSQL with TypeORM
- **Token Storage**: Redis for refresh token blacklisting
- **Email Service**: SMTP provider (e.g., SendGrid, AWS SES)
- **Rate Limiting**: Redis-based rate limiting
- **Encryption**: bcrypt for password hashing

### 2.3 Data Flow

The authentication flow involves these steps:

1. User registration with email and password
2. System checks if user already exists
3. If new user, system hashes password and creates account
4. System sends verification email
5. User login with credentials
6. System validates credentials against stored data
7. System generates JWT access and refresh tokens
8. System updates last login timestamp
9. Client accesses protected resources using tokens
10. System validates JWT tokens for each request
11. Token refresh process for expired access tokens
12. System validates refresh token and generates new tokens

## 3. API Endpoints Reference

### 3.1 Authentication Endpoints

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/auth/register` | POST | User registration with email verification | Public |
| `/auth/verify-email` | GET/POST | Email verification with token | Public |
| `/auth/login` | POST | User login with credentials | Public |
| `/auth/refresh` | POST | Refresh access token | Refresh token |
| `/auth/logout` | POST | User logout and token invalidation | JWT |
| `/auth/forgot-password` | POST | Initiate password reset process | Public |
| `/auth/reset-password` | POST | Reset password with token | Public |
| `/auth/change-password` | PUT | Change password (authenticated) | JWT |
| `/auth/profile` | GET | Get authenticated user profile | JWT |
| `/auth/profile` | PUT | Update user profile | JWT |

### 3.2 Request/Response Schema

#### Register User
Registration endpoint accepts user email, password, and personal information, and returns a success response with user data and a message prompting email verification.

#### Login User
Login endpoint accepts user credentials and returns authentication tokens along with user data for successful authentication.

#### Refresh Token
Token refresh endpoint accepts a valid refresh token and returns new access and refresh tokens.

### 3.3 Authentication Requirements

#### JWT Token Structure
- **Access Token**: Short-lived (15 minutes), contains user ID and roles
- **Refresh Token**: Long-lived (30 days), stored in HTTP-only cookie
- **Token Claims**:
  - `sub`: User ID
  - `email`: User email
  - `iat`: Issued at timestamp
  - `exp`: Expiration timestamp
  - `roles`: User roles/permissions

#### Security Headers
- `HttpOnly`: Prevents XSS attacks
- `Secure`: Only transmitted over HTTPS
- `SameSite`: Prevents CSRF attacks
- `Max-Age`: Token expiration time

## 4. Data Models & ORM Mapping

### 4.1 User Model

The User model contains fields for user identification, authentication credentials, personal information, email verification status, password reset tokens, account status, failed login attempts, lockout information, preferences, and timestamps for creation and updates.

### 4.2 Token Model

The RefreshToken model contains fields for token identification, the token value itself, associated user ID, expiration timestamp, client information (IP address and user agent), revocation status, and creation timestamp.

### 4.3 Database Schema

The database schema includes a users table with fields for user information, authentication data, email verification, password reset functionality, account status, and security tracking. It also includes a refresh_tokens table for storing refresh token information with references to users.

## 5. Business Logic Layer

### 5.1 Registration Flow

The registration flow involves validating user input, checking for existing email addresses, hashing the password, creating a user record, generating a verification token, saving the token to the database, sending a verification email, and returning a success response.

### 5.2 Login Flow

The login flow involves validating user input, checking if the user exists, verifying if the account is locked, verifying the password, handling failed login attempts (including account lockout after 5 failed attempts), resetting failed attempts on successful login, updating the last login timestamp, generating JWT tokens, saving the refresh token, and returning tokens to the client.

### 5.3 Password Reset Flow

The password reset flow involves validating the email address, checking if the user exists, generating a reset token, setting token expiration, saving the token to the database, sending a reset email, and returning a success response. When the user clicks the reset link, the system validates the token, checks token expiration, shows the reset password form, validates the new password, hashes the new password, updates the user password, deletes the reset token, sends a confirmation email, and returns a success response.

### 5.4 Token Refresh Flow

The token refresh flow involves validating the refresh token, checking if the token is expired, checking if the token has been revoked, blacklisting the current token, generating new tokens, saving the new refresh token, and returning the new tokens to the client.

### 5.5 Logout Flow

The logout flow involves validating the access token, extracting the user ID from the token, revoking the refresh token, clearing client cookies, and returning a success response.

## 6. Middleware & Interceptors

### 6.1 Authentication Middleware

#### JWT Verification
- Validates JWT token signature and expiration
- Extracts user information from token claims
- Attaches user object to request context
- Handles expired and invalid token scenarios

#### Role-Based Access Control (RBAC)
- Checks user permissions for protected routes
- Supports role hierarchy and permission inheritance
- Custom decorators for granular access control

### 6.2 Security Interceptors

#### Rate Limiting
- Implements token bucket algorithm for rate limiting
- Configurable limits per endpoint
- IP-based and user-based rate limiting
- Automatic rate limit reset after time window

#### Request Validation
- Validates request payloads against defined schemas
- Sanitizes input to prevent injection attacks
- Provides detailed validation error messages

#### Logging Interceptor
- Logs authentication attempts and outcomes
- Tracks security-related events
- Monitors for suspicious activities

### 6.3 Session Management

#### Token Blacklisting
- Maintains blacklist of revoked refresh tokens
- Uses Redis for fast token validation
- Automatic cleanup of expired tokens

#### Concurrent Session Control
- Limits number of active sessions per user
- Allows user to view active sessions
- Enables session termination from other devices

## 7. Security Measures

### 7.1 Password Security
- bcrypt hashing with salt rounds >= 12
- Password strength requirements (min 8 chars, mixed case, numbers, special chars)
- Password history to prevent reuse
- Rate limiting on password reset requests

### 7.2 Account Protection
- Account lockout after 5 failed login attempts
- 30-minute lockout duration
- Admin unlock capability
- Email notification on lockout events

### 7.3 Token Security
- Asymmetric JWT signing (RS256)
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens with rotation
- HTTP-only, Secure, SameSite cookies
- Token blacklisting on logout

### 7.4 Rate Limiting
- 10 requests/minute for authentication endpoints
- Separate limits for different endpoints
- IP-based and user-based limiting
- Adaptive rate limiting for suspicious behavior

### 7.5 Input Validation
- Schema validation for all inputs
- Sanitization to prevent injection attacks
- Length and format validation
- Unicode normalization

## 8. Testing

### 8.1 Unit Tests

#### Authentication Service Tests
- User registration with valid/invalid data
- Email verification with valid/invalid tokens
- Login with valid/invalid credentials
- Password reset request and completion
- Token refresh with valid/invalid tokens
- Logout functionality

#### Security Tests
- Password hashing and verification
- JWT token generation and validation
- Rate limiting enforcement
- Account lockout mechanisms

### 8.2 Integration Tests

#### API Endpoint Tests
- Registration endpoint with various inputs
- Login endpoint with various credentials
- Password reset flow end-to-end
- Token refresh endpoint
- Profile management endpoints

#### Security Integration Tests
- CSRF protection
- XSS prevention
- SQL injection prevention
- Rate limiting across multiple requests

### 8.3 Test Cases Coverage

#### Registration Test Cases
- Valid registration with proper email and password
- Invalid email format rejection
- Password strength validation
- Duplicate email rejection
- Email verification workflow
- Registration confirmation redirect

#### Login Test Cases
- Valid login with correct credentials
- Invalid credentials error handling
- Successful redirect to dashboard
- JWT token generation and validation
- "Remember me" functionality
- Account lockout after 5 failed attempts

#### Password Reset Test Cases
- Password reset request with valid email
- Password reset email delivery
- 24-hour token expiration
- New password strength requirements
- Successful login after password reset
- Session invalidation after reset

#### Session Management Test Cases
- Refresh token generation
- Token refresh workflow
- Expired token handling
- Concurrent session management
- Token storage security

#### Rate Limiting Test Cases
- Rate limit enforcement
- Rate limit exceeded response
- Rate limit reset after time window
- Different limits for different endpoints

#### Account Lockout Test Cases
- Lockout after 5 failed attempts
- Lockout duration enforcement
- Unlock after time period
- Admin unlock capability
- Lockout notification