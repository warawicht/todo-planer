# Frontend Not Working on localhost:3001 - Issue Analysis and Solution

## Overview

The frontend application for the todo-planer project is not displaying anything when accessing `localhost:3001`. This document analyzes the potential causes and provides solutions to fix this issue.

## Problem Analysis

Based on the codebase analysis, the following issues were identified:

### 1. Incorrect Environment Variable Usage
The frontend application uses `process.env.REACT_APP_API_URL` in the AuthService, but Vite uses `import.meta.env.VITE_*` for environment variables. This mismatch can cause issues with API configuration.

### 2. Potential JavaScript Runtime Errors
There might be runtime JavaScript errors preventing the React app from rendering, which would result in a blank page.

### 3. Proxy Configuration Issues
Although the Vite config has proxy settings, there might be issues with how requests are being handled between the frontend and backend.

### 4. Missing Error Handling
The application lacks proper error boundaries and logging, making it difficult to identify issues when they occur.

## Technical Details

### Vite Configuration
The `vite.config.ts` file shows:
- Port is correctly set to 3001
- Proxy is configured for various API endpoints (`/api`, `/auth`, `/productivity`, etc.)
- Build output is directed to `dist/frontend`

### Entry Points
- `index.html` properly references the root div
- `index.tsx` correctly mounts the React app to the root div using ReactDOM.createRoot
- `App.tsx` implements routing with react-router-dom and includes protected routes

### Authentication Flow
- Uses AuthContext for managing authentication state
- Implements protected routes that redirect unauthenticated users
- Uses localStorage for storing access tokens
- AuthService handles API calls with axios including interceptors for token management

### Backend Integration
- The backend is configured to serve static files from the frontend dist directory
- Backend runs on port 3000 by default

## Root Cause Analysis

The most likely causes for the blank page are:

1. **Environment Variable Mismatch**: The frontend uses React's environment variable pattern instead of Vite's, which can cause undefined values.

2. **JavaScript Runtime Errors**: Uncaught exceptions during app initialization prevent the UI from rendering.

3. **CORS/Proxy Misconfiguration**: API requests might be failing due to incorrect proxy setup.

4. **Missing Error Boundaries**: Without proper error boundaries, JavaScript errors result in blank pages instead of meaningful error messages.

## Solution Recommendations

### 1. Fix Environment Variable Usage
Update the AuthService to use Vite's environment variables:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:3000
```

### 2. Add Error Boundaries
Implement React error boundaries to catch and display errors gracefully.

### 3. Enhance Logging
Add console logging in key components to help identify where failures occur.

### 4. Verify Proxy Configuration
Ensure the proxy settings in `vite.config.ts` correctly forward API requests to the backend.

## Common Issues and Solutions

### Blank Page with No Console Errors
- **Cause**: Uncaught exceptions during initialization
- **Solution**: Add error boundaries and logging

### Environment Variables Not Loading
- **Cause**: Using React's `process.env` instead of Vite's `import.meta.env`
- **Solution**: Update all environment variable references

### Proxy Not Working
- **Cause**: Incorrect proxy configuration or path matching
- **Solution**: Verify proxy settings in `vite.config.ts` and ensure API paths match

### Module Import Errors
- **Cause**: Incorrect import paths or missing dependencies
- **Solution**: Check import statements and ensure all dependencies are installed

### Port Conflicts
- **Cause**: Another application using port 3001
- **Solution**: Change port in `vite.config.ts` or stop conflicting application

### Missing Dependencies
- **Cause**: Dependencies not installed or node_modules missing
- **Solution**: Run `npm install` or `pnpm install` to install dependencies

## Implementation Steps

### 1. Create Environment Configuration

Create a `.env` file in the frontend directory with the following content:

```
VITE_API_URL=http://localhost:3000
```

### 2. Update AuthService

Modify `/frontend/services/auth.service.ts` to use Vite's environment variables:

```typescript
// Replace this line:
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// With this:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### 3. Install Dependencies

Ensure all dependencies are installed:

```bash
# If using npm
npm install

# If using pnpm
pnpm install
```

### 4. Add Error Boundaries

Create an ErrorBoundary component and wrap the main App component with it.

### 5. Add Console Logging

Add console.log statements in key components to help identify initialization issues:
- `index.tsx` - After ReactDOM.createRoot
- `App.tsx` - In the main App component
- `AuthContext.tsx` - In the AuthProvider useEffect

### 6. Test the Application

Start both backend and frontend:

```bash
# Start backend
npm run start:dev

# In another terminal, start frontend
npm run frontend:dev
```

Verify that the application loads correctly at `http://localhost:3001`

## Debugging Steps

1. **Check Browser Console**: Open browser developer tools and check for JavaScript errors in the console
2. **Verify Network Requests**: Check the Network tab to see if requests to `localhost:3001` are successful
3. **Test API Endpoints**: Verify that backend API endpoints are accessible at `localhost:3000`
4. **Check Vite Dev Server**: Ensure the Vite development server is running on port 3001
5. **Verify Environment Variables**: Confirm that environment variables are properly loaded

## Testing Plan

1. Verify that the frontend starts without build errors
2. Check browser console for JavaScript errors
3. Confirm that API calls are properly proxied to the backend
4. Test authentication flow with valid credentials
5. Verify that protected routes work correctly for authenticated users
6. Test error scenarios to ensure error boundaries work properly

## Conclusion

The blank page issue is most likely caused by environment variable misconfiguration combined with inadequate error handling. By updating the environment variable usage to match Vite's conventions and adding proper error boundaries, we can resolve the issue and improve the application's resilience.