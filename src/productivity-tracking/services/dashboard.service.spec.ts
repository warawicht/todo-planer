import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardWidget } from '../entities/dashboard-widget.entity';
import { StatisticsService } from './statistics.service';
import { TimeTrackingService } from './time-tracking.service';
import { TrendAnalysisService } from './trend-analysis.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let dashboardWidgetRepository: Repository<DashboardWidget>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(DashboardWidget),
          useClass: Repository,
        },
        {
          provide: StatisticsService,
          useValue: {
            calculateDailyStatistics: jest.fn(),
            calculateWeeklyStatistics: jest.fn(),
            calculateMonthlyStatistics: jest.fn(),
          },
        },
        {
          provide: TimeTrackingService,
          useValue: {
            generateTimeReport: jest.fn(),
          },
        },
        {
          provide: TrendAnalysisService,
          useValue: {
            getTrendDataByPeriod: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    dashboardWidgetRepository = module.get<Repository<DashboardWidget>>(
      getRepositoryToken(DashboardWidget),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addWidget', () => {
    it('should add a widget', async () => {
      const userId = 'test-user-id';
      const widgetConfig = {
        userId,
        widgetType: 'test-widget',
        position: 1,
        config: {},
      };

      // Mock repository methods
      jest.spyOn(dashboardWidgetRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: '1' }),
      } as any);
      jest.spyOn(dashboardWidgetRepository, 'create').mockImplementation(dto => dto as any);
      jest.spyOn(dashboardWidgetRepository, 'save').mockImplementation(dto => Promise.resolve(dto as any));

      const result = await service.addWidget(userId, widgetConfig);

      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.widgetType).toBe(widgetConfig.widgetType);
    });
  });
});