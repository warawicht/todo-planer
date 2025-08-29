# Use Node.js 18 LTS as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Build the backend application
RUN npm run build

# Build the frontend application
RUN npm run frontend:build

# Copy frontend build to backend static directory
RUN mkdir -p dist/src/public
RUN cp -r frontend/dist/* dist/src/public/

# Expose the port the app runs on
EXPOSE 3000

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory to the nestjs user
RUN chown -R nestjs:nodejs /app

# Switch to the non-root user
USER nestjs

# Define the command to run the application
CMD ["node", "dist/src/main.js"]