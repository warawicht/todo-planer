#!/usr/bin/env node

/**
 * Simple test script to verify demo data creation
 */

import { DemoDataService } from '../backend/demo-data/demo-data.service';

// Mock services for testing
const mockUsersService = {
  create: async () => ({ id: 'user1', email: 'test@example.com' }),
};

const mockProjectsService = {
  create: async () => ({ id: 'project1' }),
};

const mockTasksService = {
  create: async () => ({ id: 'task1' }),
};

const mockTagsService = {
  create: async () => ({ id: 'tag1' }),
};

const mockTimeBlocksService = {
  create: async () => ({ id: 'timeblock1' }),
};

// Set environment variables for testing
process.env.ENABLE_DEMO_DATA = 'true';

async function testDemoData() {
  console.log('Testing demo data creation...');
  
  try {
    // Create an instance of DemoDataService with mock services
    const demoDataService = new DemoDataService(
      mockUsersService as any,
      mockProjectsService as any,
      mockTasksService as any,
      mockTagsService as any,
      mockTimeBlocksService as any,
    );
    
    // Test the createDemoData method
    await demoDataService.createDemoData();
    
    console.log('Demo data creation test completed successfully!');
  } catch (error) {
    console.error('Error testing demo data creation:', error);
  }
}

// Run the test
testDemoData();