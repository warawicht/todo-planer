#!/bin/bash

# Startup script for the authentication system
echo "Starting Authentication System..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the application in development mode
echo "Starting application in development mode..."
npm run start:dev