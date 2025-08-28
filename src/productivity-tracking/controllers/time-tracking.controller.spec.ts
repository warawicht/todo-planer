import { Test, TestingModule } from '@nestjs/testing';
import { TimeTrackingController } from './time-tracking.controller';
import { TimeTrackingService } from '../services/time-tracking.service';

describe('TimeTrackingController', () => {
  let controller: TimeTrackingController;
  let service: TimeTrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeTrackingController],
      providers: [
        {
          provide: TimeTrackingService,
          useValue: {
            createTimeEntry: jest.fn(),
            getTimeEntriesForDateRange: jest.fn(),
            updateTimeEntry: jest.fn(),
            deleteTimeEntry: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TimeTrackingController>(TimeTrackingController);
    service = module.get<TimeTrackingService>(TimeTrackingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTimeEntry', () => {
    it('should create a time entry', async () => {
      const timeEntryDto = {
        userId: 'test-user-id',
        startTime: new Date(),
        isManual: true,
      };
      const mockTimeEntry = {
        id: '1',
        ...timeEntryDto,
        endTime: null,
        duration: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(service, 'createTimeEntry')
        .mockResolvedValue(mockTimeEntry as any);

      const result = await controller.createTimeEntry(timeEntryDto);

      expect(result).toBeDefined();
      expect(result.userId).toBe(timeEntryDto.userId);
      expect(result.isManual).toBe(true);
    });
  });
});