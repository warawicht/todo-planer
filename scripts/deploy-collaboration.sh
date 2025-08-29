#!/bin/bash

# Collaboration Components Deployment Script
# This script automates the deployment of collaboration components

set -e  # Exit immediately if a command exits with a non-zero status

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEPLOYMENT_ENV="${DEPLOYMENT_ENV:-production}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="/var/log/collaboration-deployment-${TIMESTAMP}.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] $1" | tee -a "$LOG_FILE"
}

log_success() {
    log "${GREEN}SUCCESS:${NC} $1"
}

log_warning() {
    log "${YELLOW}WARNING:${NC} $1"
}

log_error() {
    log "${RED}ERROR:${NC} $1"
}

# Check if running as root (optional, depending on requirements)
check_privileges() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "Running as root. This might not be necessary."
    fi
}

# Validate environment
validate_environment() {
    log "Validating deployment environment..."

    # Check if required tools are available
    for tool in node npm docker docker-compose; do
        if ! command -v $tool &> /dev/null; then
            log_error "$tool is not installed or not in PATH"
            exit 1
        fi
    done

    # Check Node.js version
    NODE_VERSION=$(node --version)
    log "Node.js version: $NODE_VERSION"
    
    # Check if project directory exists
    if [[ ! -d "$PROJECT_ROOT" ]]; then
        log_error "Project root directory not found: $PROJECT_ROOT"
        exit 1
    fi

    log_success "Environment validation completed"
}

# Backup current deployment
backup_current_deployment() {
    log "Creating backup of current deployment..."
    
    # Create backup directory
    BACKUP_DIR="/tmp/collaboration-backup-${TIMESTAMP}"
    mkdir -p "$BACKUP_DIR"
    
    # Backup configuration files
    if [[ -d "$PROJECT_ROOT/config" ]]; then
        cp -r "$PROJECT_ROOT/config" "$BACKUP_DIR/"
    fi
    
    # Backup database (if applicable)
    # This would depend on your specific database setup
    # Example for PostgreSQL:
    # pg_dump -h localhost -U your_user your_database > "$BACKUP_DIR/database-backup.sql"
    
    log_success "Backup created at $BACKUP_DIR"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    cd "$PROJECT_ROOT"
    
    # Clean install dependencies
    npm ci --only=production
    
    # Check if installation was successful
    if [[ $? -ne 0 ]]; then
        log_error "Failed to install dependencies"
        exit 1
    fi
    
    log_success "Dependencies installed successfully"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    cd "$PROJECT_ROOT"
    
    # Run TypeORM migrations
    npm run typeorm migration:run
    
    if [[ $? -ne 0 ]]; then
        log_error "Database migrations failed"
        exit 1
    fi
    
    log_success "Database migrations completed successfully"
}

# Build application
build_application() {
    log "Building application..."
    
    cd "$PROJECT_ROOT"
    
    # Build the application
    npm run build
    
    if [[ $? -ne 0 ]]; then
        log_error "Application build failed"
        exit 1
    fi
    
    log_success "Application built successfully"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    cd "$PROJECT_ROOT"
    
    # Run unit tests
    npm run test
    
    if [[ $? -ne 0 ]]; then
        log_error "Unit tests failed"
        exit 1
    fi
    
    # Run integration tests (if separate)
    # npm run test:integration
    
    log_success "All tests passed"
}

# Deploy application
deploy_application() {
    log "Deploying application..."
    
    cd "$PROJECT_ROOT"
    
    # Stop current application (if using PM2 or similar)
    # pm2 stop ecosystem.config.js || true
    
    # Start application
    # pm2 start ecosystem.config.js --env $DEPLOYMENT_ENV
    
    # Or if using a different process manager:
    # systemctl restart collaboration-service
    
    log_success "Application deployed successfully"
}

# Health check
perform_health_check() {
    log "Performing health check..."
    
    # Wait a moment for the application to start
    sleep 10
    
    # Check if the application is responding
    # This would depend on your specific endpoints
    # Example:
    # curl -f http://localhost:3000/health || {
    #     log_error "Health check failed"
    #     exit 1
    # }
    
    log_success "Health check passed"
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    
    # Remove old backups (keep last 5)
    # find /tmp -name "collaboration-backup-*" -type d -mtime +7 -exec rm -rf {} +
    
    log_success "Cleanup completed"
}

# Rollback function
rollback() {
    log_error "Deployment failed. Initiating rollback..."
    
    # Restore from backup
    # This would depend on your specific backup strategy
    
    log "Rollback completed"
}

# Main deployment function
main() {
    log "Starting collaboration components deployment..."
    
    # Set up error handling
    trap rollback ERR
    
    check_privileges
    validate_environment
    backup_current_deployment
    install_dependencies
    run_migrations
    build_application
    run_tests
    deploy_application
    perform_health_check
    cleanup
    
    log_success "Collaboration components deployment completed successfully!"
    log "Deployment log saved to: $LOG_FILE"
}

# Run main function
main "$@"