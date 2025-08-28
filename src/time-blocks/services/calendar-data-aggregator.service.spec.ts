import { Test, TestingModule } from '@nestjs/testing';
import { CalendarDataAggregatorService } from './calendar-data-aggregator.service';
import { TimeBlock } from '../entities/time-block.entity';
import { CalendarViewType } from '../dto/calendar-view.dto';

describe('CalendarDataAggregatorService', () => {
  let service: CalendarDataAggregatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalendarDataAggregatorService],
    }).compile();

    service = module.get<CalendarDataAggregatorService>(CalendarDataAggregatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('aggregateTimeBlocks', () => {
    it('should aggregate time blocks for day view', () => {
      const timeBlocks: TimeBlock[] = [
        createTimeBlock('1', 'Meeting', new Date('2023-06-15T09:00:00'), new Date('2023-06-15T10:00:00')),
      ];
      const startDate = new Date('2023-06-15T00:00:00');
      const endDate = new Date('2023-06-15T23:59:59.999');
      
      const result = service.aggregateTimeBlocks(timeBlocks, CalendarViewType.DAY, startDate, endDate);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].title).toBe('Meeting');
      expect(result[0].position).toBeDefined();
    });

    it('should aggregate time blocks for week view', () => {
      const timeBlocks: TimeBlock[] = [
        createTimeBlock('1', 'Meeting', new Date('2023-06-15T09:00:00'), new Date('2023-06-15T10:00:00')),
      ];
      const startDate = new Date('2023-06-11T00:00:00');
      const endDate = new Date('2023-06-17T23:59:59.999');
      
      const result = service.aggregateTimeBlocks(timeBlocks, CalendarViewType.WEEK, startDate, endDate);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].title).toBe('Meeting');
      expect(result[0].position).toBeDefined();
    });

    it('should aggregate time blocks for month view', () => {
      const timeBlocks: TimeBlock[] = [
        createTimeBlock('1', 'Meeting', new Date('2023-06-15T09:00:00'), new Date('2023-06-15T10:00:00')),
      ];
      const startDate = new Date('2023-06-01T00:00:00');
      const endDate = new Date('2023-06-30T23:59:59.999');
      
      const result = service.aggregateTimeBlocks(timeBlocks, CalendarViewType.MONTH, startDate, endDate);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].title).toBe('Meeting');
      expect(result[0].displayDate).toBe('2023-06-15');
    });

    it('should throw error for unsupported view type', () => {
      const timeBlocks: TimeBlock[] = [];
      const startDate = new Date('2023-06-15T00:00:00');
      const endDate = new Date('2023-06-15T23:59:59.999');
      
      expect(() => {
        // @ts-ignore - Testing unsupported view type
        service.aggregateTimeBlocks(timeBlocks, 'unsupported' as CalendarViewType, startDate, endDate);
      }).toThrow();
    });
  });

  describe('calculateDayViewPosition', () => {
    it('should calculate correct position for time block in day view', () => {
      // Create time block at 9:00 AM to 10:00 AM (local time)
      const timeBlock = createTimeBlock('1', 'Meeting', new Date('2023-06-15T09:00:00'), new Date('2023-06-15T10:00:00'));
      const referenceDate = new Date('2023-06-15T00:00:00');
      
      const result = (service as any).calculateDayViewPosition(timeBlock, referenceDate);
      
      // 9 AM = 9 * 60 = 540 minutes
      // Position = (540 / 1440) * 1000 = 375
      expect(result.top).toBeCloseTo(375, 0);
      
      // Duration = 1 hour = 60 minutes
      // Height = (60 / 1440) * 1000 = 41.67
      expect(result.height).toBeCloseTo(41.67, 1);
      
      expect(result.left).toBe(0);
      expect(result.width).toBe(100);
    });
  });

  describe('calculateWeekViewPosition', () => {
    it('should calculate correct position for time block in week view', () => {
      // Create time block at 9:00 AM to 10:00 AM (local time)
      const timeBlock = createTimeBlock('1', 'Meeting', new Date('2023-06-15T09:00:00'), new Date('2023-06-15T10:00:00'));
      // June 11, 2023 is a Sunday
      const weekStartDate = new Date('2023-06-11T00:00:00');
      
      const result = (service as any).calculateWeekViewPosition(timeBlock, weekStartDate);
      
      // 9 AM = 9 * 60 = 540 minutes
      // Position = (540 / 1440) * 1000 = 375
      expect(result.top).toBeCloseTo(375, 0);
      
      // Duration = 1 hour = 60 minutes
      // Height = (60 / 1440) * 1000 = 41.67
      expect(result.height).toBeCloseTo(41.67, 1);
      
      // June 15, 2023 is a Thursday (day 4, where Sunday is day 0)
      // Left position = 4 * 14.28 = 57.12
      expect(result.left).toBeCloseTo(57.12, 1);
      
      // Width = 14.28
      expect(result.width).toBeCloseTo(14.28, 1);
    });
  });
});

function createTimeBlock(id: string, title: string, startTime: Date, endTime: Date): TimeBlock {
  const timeBlock = new TimeBlock();
  timeBlock.id = id;
  timeBlock.title = title;
  timeBlock.startTime = startTime;
  timeBlock.endTime = endTime;
  return timeBlock;
}