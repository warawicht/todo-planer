#!/bin/bash

# Health check script for the todo-planer application
echo "Performing health check..."

# Check if the backend application is running
if curl -s http://localhost:3000/health > /dev/null; then
  echo "✅ Backend application is running and healthy"
else
  echo "❌ Backend application is not responding"
  exit 1
fi

# Check if the frontend application is running
if curl -s http://localhost:3001 > /dev/null; then
  echo "✅ Frontend application is running and accessible"
else
  echo "❌ Frontend application is not responding"
fi

# Check if the auth endpoints are accessible
if curl -s http://localhost:3000/auth/register > /dev/null; then
  echo "✅ Auth endpoints are accessible"
else
  echo "❌ Auth endpoints are not accessible"
fi

echo "Health check completed."