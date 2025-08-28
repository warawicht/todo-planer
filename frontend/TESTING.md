# Frontend Testing

This directory contains React components and utilities for the calendar views implementation. The tests are written using React Testing Library and Jest.

## Test Structure

- `components/*.test.tsx` - Unit tests for React components
- `components/*.perf.test.tsx` - Performance tests for React components
- `hooks/*.test.ts` - Unit tests for custom hooks
- `services/*.test.ts` - Unit tests for service layer
- `utils/*.test.ts` - Unit tests for utility functions

## Running Tests

The frontend tests are not automatically picked up by the current Jest configuration, which only looks for `.spec.ts` files in the `src` directory.

To run the frontend tests, you would typically need to:

1. Install additional dependencies for frontend testing:
   ```bash
   npm install --save-dev @testing-library/react @testing-library/jest-dom jsdom
   ```

2. Create a separate Jest configuration for frontend tests:
   ```bash
   // jest.frontend.config.js
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'jsdom',
     setupFilesAfterEnv: ['<rootDir>/frontend/setupTests.ts'],
     testMatch: ['<rootDir>/frontend/**/*.test.{ts,tsx}'],
     moduleNameMapper: {
       '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
     },
   };
   ```

3. Add a script to package.json:
   ```json
   {
     "scripts": {
       "test:frontend": "jest --config jest.frontend.config.js"
     }
   }
   ```

4. Run the frontend tests:
   ```bash
   npm run test:frontend
   ```

## Test Coverage

The frontend tests cover:

1. Component rendering and behavior
2. Hook functionality
3. Service layer interactions
4. Utility function correctness
5. Performance benchmarks

## Mocking

The tests use mocks for:
- API calls through the service layer
- React hooks like `useCalendar`
- External dependencies

This ensures tests are fast, reliable, and don't depend on external services.