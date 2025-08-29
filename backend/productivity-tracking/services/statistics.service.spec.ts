import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatisticsService } from './statistics.service';
import { ProductivityStatistic } from '../entities/productivity-statistic.entity';
import { Task } from '../../tasks/entities/task.entity';
import { TimeBlock } from '../../time-blocks/entities/time-block.entity';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let statisticRepository: Repository<ProductivityStatistic>;
  let taskRepository: Repository<Task>;
  let timeBlockRepository: Repository<TimeBlock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getRepositoryToken(ProductivityStatistic),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Task),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(TimeBlock),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    statisticRepository = module.get<Repository<ProductivityStatistic>>(
      getRepositoryToken(ProductivityStatistic),
    );
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    timeBlockRepository = module.get<Repository<TimeBlock>>(
      getRepositoryToken(TimeBlock),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateDailyStatistics', () => {
    it('should calculate daily statistics', async () => {
      const userId = 'test-user-id';
      const date = new Date();

      // Mock repository methods
      jest.spyOn(taskRepository, 'count').mockResolvedValue(5);
      jest.spyOn(timeBlockRepository, 'find').mockResolvedValue([]);
      jest.spyOn(taskRepository, 'find').mockResolvedValue([]);
      jest.spyOn(statisticRepository, 'create').mockImplementation(dto => dto as any);
      jest.spyOn(statisticRepository, 'save').mockImplementation(dto => Promise.resolve(dto as any));

      const result = await service.calculateDailyStatistics(userId, date);

      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.date).toBe(date);
    });
  });
});