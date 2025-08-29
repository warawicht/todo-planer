import { Test, TestingModule } from '@nestjs/testing';
import { SchedulingSuggestionService } from './scheduling-suggestion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AISuggestion } from '../entities/ai-suggestion.entity';
import { TimeBlocksService } from '../../time-blocks/time-blocks.service';
import { TasksService } from '../../tasks/tasks.service';

describe('SchedulingSuggestionService', () => {
  let service: SchedulingSuggestionService;
  let timeBlocksService: TimeBlocksService;
  let tasksService: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingSuggestionService,
        {
          provide: getRepositoryToken(AISuggestion),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: TimeBlocksService,
          useValue: {
            // Mock methods as needed
          },
        },
        {
          provide: TasksService,
          useValue: {
            // Mock methods as needed
          },
        },
      ],
    }).compile();

    service = module.get<SchedulingSuggestionService>(SchedulingSuggestionService);
    timeBlocksService = module.get<TimeBlocksService>(TimeBlocksService);
    tasksService = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSchedulingSuggestions', () => {
    it('should generate scheduling suggestions for a user', async () => {
      // Test implementation
      const userId = 'test-user-id';
      const suggestions = await service.generateSchedulingSuggestions(userId);
      expect(suggestions).toBeDefined();
    });
  });

  describe('dismissSuggestion', () => {
    it('should mark a suggestion as dismissed', async () => {
      const userId = 'test-user-id';
      const suggestionId = 'test-suggestion-id';
      
      // Mock repository response
      const mockSuggestion = { id: suggestionId, userId, isDismissed: false };
      (service as any).aiSuggestionRepository.findOne = jest.fn().mockResolvedValue(mockSuggestion);
      (service as any).aiSuggestionRepository.save = jest.fn().mockResolvedValue({ ...mockSuggestion, isDismissed: true });
      
      const result = await service.dismissSuggestion(userId, suggestionId);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.isDismissed).toBe(true);
      }
    });

    it('should return null for non-existent suggestion', async () => {
      const userId = 'test-user-id';
      const suggestionId = 'non-existent-id';
      
      // Mock repository response
      (service as any).aiSuggestionRepository.findOne = jest.fn().mockResolvedValue(null);
      
      const result = await service.dismissSuggestion(userId, suggestionId);
      expect(result).toBeNull();
    });
  });
});