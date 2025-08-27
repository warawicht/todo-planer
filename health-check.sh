#!/bin/bash

# Health check script for the authentication system
echo "Performing health check..."

# Check if the application is running
if curl -s http://localhost:3000/health > /dev/null; then
  echo "✅ Application is running and healthy"
else
  echo "❌ Application is not responding"
  exit 1
fi

# Check if the auth endpoints are accessible
if curl -s http://localhost:3000/auth/register > /dev/null; then
  echo "✅ Auth endpoints are accessible"
else
  echo "❌ Auth endpoints are not accessible"
fi

echo "Health check completed."