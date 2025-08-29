import { Test, TestingModule } from '@nestjs/testing';
import { TeamCalendarController } from './team-calendar.controller';
import { TeamCalendarService } from '../services/team-calendar.service';

describe('TeamCalendarController', () => {
  let controller: TeamCalendarController;
  let service: TeamCalendarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamCalendarController],
      providers: [
        {
          provide: TeamCalendarService,
          useValue: {
            getTeamCalendarData: jest.fn(),
            getUserCalendarData: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TeamCalendarController>(TeamCalendarController);
    service = module.get<TeamCalendarService>(TeamCalendarService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTeamCalendar', () => {
    it('should call service.getTeamCalendarData with correct parameters', async () => {
      const req = { user: { id: 'user1' } };
      const query = { userIds: ['user1', 'user2'] };
      
      jest.spyOn(service, 'getTeamCalendarData').mockResolvedValue({
        timeBlocks: [],
        availability: [],
      });

      await controller.getTeamCalendar(query as any, req as any);

      expect(service.getTeamCalendarData).toHaveBeenCalledWith(
        ['user1', 'user2'],
        undefined,
        undefined
      );
    });
  });

  describe('getUserCalendar', () => {
    it('should call service.getUserCalendarData with correct parameters', async () => {
      const userId = 'user1';
      const query = {};
      
      jest.spyOn(service, 'getUserCalendarData').mockResolvedValue({
        user: {} as any,
        timeBlocks: [],
        availability: [],
      });

      await controller.getUserCalendar(userId, query as any);

      expect(service.getUserCalendarData).toHaveBeenCalledWith(
        userId,
        undefined,
        undefined
      );
    });
  });

  describe('getMyCalendar', () => {
    it('should call service.getUserCalendarData with current user id', async () => {
      const req = { user: { id: 'user1' } };
      const query = {};
      
      jest.spyOn(service, 'getUserCalendarData').mockResolvedValue({
        user: {} as any,
        timeBlocks: [],
        availability: [],
      });

      await controller.getMyCalendar(query as any, req as any);

      expect(service.getUserCalendarData).toHaveBeenCalledWith(
        'user1',
        undefined,
        undefined
      );
    });
  });
});