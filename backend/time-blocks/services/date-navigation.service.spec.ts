import { Test, TestingModule } from '@nestjs/testing';
import { DateNavigationService } from './date-navigation.service';
import { CalendarViewType } from '../dto/calendar-view.dto';

describe('DateNavigationService', () => {
  let service: DateNavigationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DateNavigationService],
    }).compile();

    service = module.get<DateNavigationService>(DateNavigationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('navigateNext', () => {
    it('should navigate to next day for day view', () => {
      const currentDate = new Date('2023-06-15T12:00:00');
      const result = service.navigateNext(currentDate, CalendarViewType.DAY);
      
      const expectedDate = new Date('2023-06-16T12:00:00');
      expect(result).toEqual(expectedDate);
    });

    it('should navigate to next week for week view', () => {
      const currentDate = new Date('2023-06-15T12:00:00');
      const result = service.navigateNext(currentDate, CalendarViewType.WEEK);
      
      const expectedDate = new Date('2023-06-22T12:00:00');
      expect(result).toEqual(expectedDate);
    });

    it('should navigate to next month for month view', () => {
      const currentDate = new Date('2023-06-15T12:00:00');
      const result = service.navigateNext(currentDate, CalendarViewType.MONTH);
      
      const expectedDate = new Date('2023-07-15T12:00:00');
      expect(result).toEqual(expectedDate);
    });

    it('should throw error for unsupported view type', () => {
      const currentDate = new Date('2023-06-15T12:00:00');
      
      expect(() => {
        // @ts-ignore - Testing unsupported view type
        service.navigateNext(currentDate, 'unsupported' as CalendarViewType);
      }).toThrow();
    });
  });

  describe('navigatePrevious', () => {
    it('should navigate to previous day for day view', () => {
      const currentDate = new Date('2023-06-15T12:00:00');
      const result = service.navigatePrevious(currentDate, CalendarViewType.DAY);
      
      const expectedDate = new Date('2023-06-14T12:00:00');
      expect(result).toEqual(expectedDate);
    });

    it('should navigate to previous week for week view', () => {
      const currentDate = new Date('2023-06-15T12:00:00');
      const result = service.navigatePrevious(currentDate, CalendarViewType.WEEK);
      
      const expectedDate = new Date('2023-06-08T12:00:00');
      expect(result).toEqual(expectedDate);
    });

    it('should navigate to previous month for month view', () => {
      const currentDate = new Date('2023-06-15T12:00:00');
      const result = service.navigatePrevious(currentDate, CalendarViewType.MONTH);
      
      const expectedDate = new Date('2023-05-15T12:00:00');
      expect(result).toEqual(expectedDate);
    });

    it('should throw error for unsupported view type', () => {
      const currentDate = new Date('2023-06-15T12:00:00');
      
      expect(() => {
        // @ts-ignore - Testing unsupported view type
        service.navigatePrevious(currentDate, 'unsupported' as CalendarViewType);
      }).toThrow();
    });
  });

  describe('navigateToToday', () => {
    it('should return today\'s date', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const result = service.navigateToToday();
      result.setHours(0, 0, 0, 0);
      
      expect(result).toEqual(today);
    });
  });

  describe('navigateToDate', () => {
    it('should return the target date', () => {
      const targetDate = new Date('2023-12-25T12:00:00');
      const result = service.navigateToDate(targetDate);
      
      expect(result).toEqual(targetDate);
    });
  });
});