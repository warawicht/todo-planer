#!/usr/bin/env node

/**
 * Script to create demo data for testing and demonstration purposes
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../backend/app.module';
import { DemoDataService } from '../backend/demo-data/demo-data.service';

async function createDemoData() {
  console.log('Starting demo data creation...');
  
  try {
    // Create NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule);
    
    // Get the demo data service
    const demoDataService = app.get(DemoDataService);
    
    // Create demo data
    await demoDataService.createDemoData();
    
    console.log('Demo data creation completed successfully!');
    
    // Close the application context
    await app.close();
  } catch (error) {
    console.error('Error creating demo data:', error);
    process.exit(1);
  }
}

// Run the script
createDemoData();