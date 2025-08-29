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

# Try to build the application
if command -v nest &> /dev/null; then
  echo "Building application with NestJS CLI..."
  nest build || {
    echo "Build failed. This may be due to missing dependencies."
    echo "Attempting to start the application anyway..."
  }
else
  echo "NestJS CLI not found. Using npm to build..."
  npm run build || echo "Build failed, but continuing to start the application..."
fi

# Start the application in development mode
echo "Starting application in development mode..."
if command -v nest &> /dev/null; then
  nest start --watch
else
  npm run start:dev || {
    echo "Failed to start application in development mode."
    echo "Please ensure all dependencies are properly installed."
    echo "You may need to use a supported Node.js version (18.x, 20.x, or 22.x)."
    exit 1
  }
fi