import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from '../services/dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getUserDashboard: jest.fn(),
            addWidget: jest.fn(),
            updateWidget: jest.fn(),
            removeWidget: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return user dashboard', async () => {
      const userId = 'test-user-id';
      const mockDashboard = {
        widgets: [
          {
            id: '1',
            userId,
            widgetType: 'completion-chart',
            position: 1,
            config: {},
            isVisible: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            data: {},
          },
        ],
      };

      jest
        .spyOn(service, 'getUserDashboard')
        .mockResolvedValue(mockDashboard as any);

      const result = await controller.getDashboard(userId);

      expect(result).toBeDefined();
      expect(result.widgets).toHaveLength(1);
    });
  });
});