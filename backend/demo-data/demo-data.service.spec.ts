import { Test, TestingModule } from '@nestjs/testing';
import { DemoDataService } from './demo-data.service';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';
import { TagsService } from '../tags/tags.service';
import { TimeBlocksService } from '../time-blocks/time-blocks.service';
import { BadRequestException } from '@nestjs/common';

describe('DemoDataService', () => {
  let service: DemoDataService;
  let usersService: UsersService;
  let projectsService: ProjectsService;
  let tasksService: TasksService;
  let tagsService: TagsService;
  let timeBlocksService: TimeBlocksService;

  beforeEach(async () => {
    // Set environment variables for testing
    process.env.ENABLE_DEMO_DATA = 'true';
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DemoDataService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: ProjectsService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: TasksService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: TagsService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: TimeBlocksService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DemoDataService>(DemoDataService);
    usersService = module.get<UsersService>(UsersService);
    projectsService = module.get<ProjectsService>(ProjectsService);
    tasksService = module.get<TasksService>(TasksService);
    tagsService = module.get<TagsService>(TagsService);
    timeBlocksService = module.get<TimeBlocksService>(TimeBlocksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDemoData', () => {
    it('should create demo data successfully', async () => {
      // Mock the service methods to return sample data
      (usersService.create as jest.Mock).mockResolvedValue({ id: 'user1', email: 'demo1@example.com' });
      (projectsService.create as jest.Mock).mockResolvedValue({ id: 'project1' });
      (tasksService.create as jest.Mock).mockResolvedValue({ id: 'task1' });
      (tagsService.create as jest.Mock).mockResolvedValue({ id: 'tag1' });
      (timeBlocksService.create as jest.Mock).mockResolvedValue({ id: 'timeblock1' });

      await expect(service.createDemoData()).resolves.not.toThrow();
    });

    it('should handle service errors gracefully', async () => {
      // Mock one of the service methods to throw an error
      (usersService.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      // The method should still complete without throwing (errors are logged)
      await expect(service.createDemoData()).resolves.not.toThrow();
    });

    it('should throw error when demo data creation is disabled', async () => {
      // Temporarily disable demo data creation
      process.env.ENABLE_DEMO_DATA = 'false';
      
      await expect(service.createDemoData()).rejects.toThrow(BadRequestException);
      
      // Restore for other tests
      process.env.ENABLE_DEMO_DATA = 'true';
    });

    it('should throw error in production environment', async () => {
      // Simulate production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      await expect(service.createDemoData()).rejects.toThrow(BadRequestException);
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });
  });
});