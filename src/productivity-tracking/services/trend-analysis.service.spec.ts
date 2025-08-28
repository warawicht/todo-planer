import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrendAnalysisService } from './trend-analysis.service';
import { TrendData } from '../entities/trend-data.entity';
import { ProductivityStatistic } from '../entities/productivity-statistic.entity';

describe('TrendAnalysisService', () => {
  let service: TrendAnalysisService;
  let trendDataRepository: Repository<TrendData>;
  let statisticRepository: Repository<ProductivityStatistic>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrendAnalysisService,
        {
          provide: getRepositoryToken(TrendData),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ProductivityStatistic),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TrendAnalysisService>(TrendAnalysisService);
    trendDataRepository = module.get<Repository<TrendData>>(
      getRepositoryToken(TrendData),
    );
    statisticRepository = module.get<Repository<ProductivityStatistic>>(
      getRepositoryToken(ProductivityStatistic),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeTrends', () => {
    it('should analyze trends', async () => {
      const userId = 'test-user-id';
      const period = 'weekly';
      const startDate = new Date();
      const endDate = new Date();

      // Mock repository methods
      jest.spyOn(statisticRepository, 'find').mockResolvedValue([]);
      jest.spyOn(trendDataRepository, 'create').mockImplementation(dto => dto as any);
      jest.spyOn(trendDataRepository, 'save').mockImplementation(dto => Promise.resolve(dto as any));

      const result = await service.analyzeTrends(userId, period, startDate, endDate);

      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.period).toBe(period);
    });
  });
});