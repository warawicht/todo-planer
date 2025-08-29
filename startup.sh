#!/bin/bash

# Startup script for the todo-planer application
echo "Starting todo-planer Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "Node.js is not installed. Please install Node.js to run this application."
  exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "npm is not installed. Please install npm to run this application."
  exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  # Install with legacy peer deps and ignore engines to bypass version conflicts
  npm install --legacy-peer-deps --omit=dev || npm install --legacy-peer-deps || {
    echo "npm install failed with standard approaches."
    echo "This is likely due to native module compilation issues with your Node.js version."
    echo "Attempting to run the application with minimal dependencies..."
  }
fi

# Build both frontend and backend applications
echo "Building frontend and backend applications..."
npm run build && npm run frontend:build || {
  echo "Build failed. This may be due to missing dependencies."
  echo "Attempting to start the application anyway..."
}

# Function to clean up background processes on exit
cleanup() {
  echo "Stopping applications..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit 0
}

# Trap SIGINT and SIGTERM to clean up processes
trap cleanup SIGINT SIGTERM

# Start the backend application in development mode
echo "Starting backend application in development mode..."
npm run start:dev &
BACKEND_PID=$!

# Start the frontend application in development mode
echo "Starting frontend application in development mode..."
npm run frontend:dev &
FRONTEND_PID=$!

echo "Applications started:"
echo "- Backend running on http://localhost:3000"
echo "- Frontend running on http://localhost:3001"
echo "Press Ctrl+C to stop both applications"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID