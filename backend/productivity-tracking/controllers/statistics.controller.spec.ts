import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from '../services/statistics.service';

describe('StatisticsController', () => {
  let controller: StatisticsController;
  let service: StatisticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [
        {
          provide: StatisticsService,
          useValue: {
            calculateDateRangeStatistics: jest.fn(),
            calculateDailyStatistics: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StatisticsController>(StatisticsController);
    service = module.get<StatisticsService>(StatisticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStatistics', () => {
    it('should return statistics for a date range', async () => {
      const userId = 'test-user-id';
      const startDate = new Date();
      const endDate = new Date();
      const mockStats = [
        {
          id: '1',
          userId,
          date: new Date(),
          tasksCompleted: 5,
          tasksCreated: 10,
          overdueTasks: 2,
          completionRate: 0.5,
          totalTimeTracked: 3600,
          averageCompletionTime: 1.5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest
        .spyOn(service, 'calculateDateRangeStatistics')
        .mockResolvedValue(mockStats as any);

      const result = await controller.getStatistics(userId, startDate, endDate);

      expect(result).toBeDefined();
      expect(result.dailyStats).toEqual(mockStats);
    });
  });
});