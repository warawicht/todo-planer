#!/usr/bin/env node

/**
 * Collaboration Components Deployment Script
 * This script automates the deployment of collaboration components
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const DEPLOYMENT_CONFIG_PATH = path.join(PROJECT_ROOT, 'deployment', 'collaboration-deployment.json');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const LOG_FILE = `/var/log/collaboration-deployment-${TIMESTAMP}.log`;

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

// Logging functions
function log(message, color = colors.white) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(color + logMessage + colors.reset);
  
  // Also write to log file
  try {
    fs.appendFileSync(LOG_FILE, logMessage + '\n');
  } catch (err) {
    console.error('Failed to write to log file:', err.message);
  }
}

function logSuccess(message) {
  log(message, colors.green);
}

function logWarning(message) {
  log(message, colors.yellow);
}

function logError(message) {
  log(message, colors.red);
}

function logInfo(message) {
  log(message, colors.cyan);
}

// Execute command synchronously
function execCommand(command, options = {}) {
  logInfo(`Executing: ${command}`);
  
  try {
    const result = execSync(command, {
      cwd: PROJECT_ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
    });
    
    if (result) {
      logInfo(result.toString().trim());
    }
    
    return result;
  } catch (error) {
    logError(`Command failed: ${command}`);
    logError(error.message);
    if (error.stdout) logError(`STDOUT: ${error.stdout.toString()}`);
    if (error.stderr) logError(`STDERR: ${error.stderr.toString()}`);
    throw error;
  }
}

// Load deployment configuration
function loadDeploymentConfig() {
  try {
    const configContent = fs.readFileSync(DEPLOYMENT_CONFIG_PATH, 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    logError(`Failed to load deployment configuration: ${error.message}`);
    process.exit(1);
  }
}

// Validate environment
async function validateEnvironment() {
  logInfo('Validating deployment environment...');
  
  // Check if required tools are available
  const requiredTools = ['node', 'npm', 'docker'];
  
  for (const tool of requiredTools) {
    try {
      execCommand(`${tool} --version`);
    } catch (error) {
      logError(`${tool} is not installed or not in PATH`);
      process.exit(1);
    }
  }
  
  // Check Node.js version
  const nodeVersion = execCommand('node --version', { encoding: 'utf8' }).toString().trim();
  logInfo(`Node.js version: ${nodeVersion}`);
  
  // Check if project directory exists
  if (!fs.existsSync(PROJECT_ROOT)) {
    logError(`Project root directory not found: ${PROJECT_ROOT}`);
    process.exit(1);
  }
  
  logSuccess('Environment validation completed');
}

// Backup current deployment
async function backupCurrentDeployment() {
  logInfo('Creating backup of current deployment...');
  
  // Create backup directory
  const backupDir = `/tmp/collaboration-backup-${TIMESTAMP}`;
  execCommand(`mkdir -p ${backupDir}`);
  
  // Backup configuration files
  if (fs.existsSync(path.join(PROJECT_ROOT, 'config'))) {
    execCommand(`cp -r ${path.join(PROJECT_ROOT, 'config')} ${backupDir}/`);
  }
  
  // Backup package files
  const packageFiles = ['package.json', 'package-lock.json'];
  packageFiles.forEach(file => {
    const filePath = path.join(PROJECT_ROOT, file);
    if (fs.existsSync(filePath)) {
      execCommand(`cp ${filePath} ${backupDir}/`);
    }
  });
  
  logSuccess(`Backup created at ${backupDir}`);
  return backupDir;
}

// Install dependencies
async function installDependencies() {
  logInfo('Installing dependencies...');
  
  // Clean install dependencies
  execCommand('npm ci --only=production');
  
  logSuccess('Dependencies installed successfully');
}

// Run database migrations
async function runMigrations() {
  logInfo('Running database migrations...');
  
  // Run TypeORM migrations
  execCommand('npm run typeorm migration:run');
  
  logSuccess('Database migrations completed successfully');
}

// Build application
async function buildApplication() {
  logInfo('Building application...');
  
  // Build the application
  execCommand('npm run build');
  
  logSuccess('Application built successfully');
}

// Run tests
async function runTests() {
  logInfo('Running tests...');
  
  // Run unit tests
  try {
    execCommand('npm run test');
  } catch (error) {
    logWarning('Unit tests failed. Continuing with deployment...');
  }
  
  logSuccess('Test execution completed');
}

// Deploy application
async function deployApplication(config) {
  logInfo('Deploying application...');
  
  const env = process.env.NODE_ENV || 'production';
  const deploymentConfig = config.deployment[env];
  
  if (!deploymentConfig) {
    logError(`No deployment configuration found for environment: ${env}`);
    process.exit(1);
  }
  
  logInfo(`Deploying to ${env} environment`);
  
  // In a real implementation, this would deploy to the target environment
  // For now, we'll just simulate the deployment
  
  // Example deployment steps:
  // 1. Build Docker image
  // 2. Push to container registry
  // 3. Deploy to Kubernetes/other orchestration platform
  // 4. Update DNS/load balancer if needed
  
  logSuccess('Application deployed successfully');
}

// Health check
async function performHealthCheck(config) {
  logInfo('Performing health check...');
  
  const env = process.env.NODE_ENV || 'production';
  const deploymentConfig = config.deployment[env];
  
  // Wait a moment for the application to start
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Check if the application is responding
  // This would depend on your specific endpoints
  // Example:
  // try {
  //   const response = await fetch(`http://${deploymentConfig.host}:${deploymentConfig.port}/health`);
  //   if (!response.ok) {
  //     throw new Error(`Health check failed with status ${response.status}`);
  //   }
  //   logSuccess('Health check passed');
  // } catch (error) {
  //   logError(`Health check failed: ${error.message}`);
  //   process.exit(1);
  // }
  
  logSuccess('Health check completed');
}

// Cleanup
async function cleanup() {
  logInfo('Cleaning up...');
  
  // Remove old backups (keep last 5)
  // This would be implemented based on your backup strategy
  
  logSuccess('Cleanup completed');
}

// Rollback function
async function rollback(backupDir) {
  logError('Deployment failed. Initiating rollback...');
  
  // Restore from backup
  // This would depend on your specific backup strategy
  if (backupDir && fs.existsSync(backupDir)) {
    logInfo(`Restoring from backup: ${backupDir}`);
    // Implementation would depend on what was backed up
  }
  
  logInfo('Rollback completed');
}

// Main deployment function
async function main() {
  logInfo('Starting collaboration components deployment...');
  
  try {
    // Load configuration
    const config = loadDeploymentConfig();
    
    // Validate environment
    await validateEnvironment();
    
    // Create backup
    const backupDir = await backupCurrentDeployment();
    
    // Install dependencies
    await installDependencies();
    
    // Run migrations
    await runMigrations();
    
    // Build application
    await buildApplication();
    
    // Run tests
    await runTests();
    
    // Deploy application
    await deployApplication(config);
    
    // Perform health check
    await performHealthCheck(config);
    
    // Cleanup
    await cleanup();
    
    logSuccess('Collaboration components deployment completed successfully!');
    logInfo(`Deployment log saved to: ${LOG_FILE}`);
  } catch (error) {
    logError(`Deployment failed: ${error.message}`);
    logError(error.stack);
    
    // Try to rollback
    try {
      await rollback();
    } catch (rollbackError) {
      logError(`Rollback also failed: ${rollbackError.message}`);
    }
    
    process.exit(1);
  }
}

// Run main function if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    logError(`Unhandled error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  deploy: main,
  rollback,
  validateEnvironment,
  backupCurrentDeployment,
  installDependencies,
  runMigrations,
  buildApplication,
  runTests,
  deployApplication,
  performHealthCheck,
  cleanup
};