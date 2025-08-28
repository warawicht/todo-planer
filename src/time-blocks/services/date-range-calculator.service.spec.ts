import { Test, TestingModule } from '@nestjs/testing';
import { DateRangeCalculatorService } from './date-range-calculator.service';
import { CalendarViewType } from '../dto/calendar-view.dto';

describe('DateRangeCalculatorService', () => {
  let service: DateRangeCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DateRangeCalculatorService],
    }).compile();

    service = module.get<DateRangeCalculatorService>(DateRangeCalculatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateDateRange', () => {
    it('should calculate correct date range for day view', () => {
      const referenceDate = new Date('2023-06-15T12:00:00'); // Local time
      const result = service.calculateDateRange(CalendarViewType.DAY, referenceDate);
      
      // Create expected dates in local time
      const expectedStartDate = new Date('2023-06-15T00:00:00');
      const expectedEndDate = new Date('2023-06-15T23:59:59.999');
      
      expect(result.startDate).toEqual(expectedStartDate);
      expect(result.endDate).toEqual(expectedEndDate);
    });

    it('should calculate correct date range for week view', () => {
      const referenceDate = new Date('2023-06-15T12:00:00'); // Thursday, June 15, 2023
      const result = service.calculateDateRange(CalendarViewType.WEEK, referenceDate);
      
      // Create expected dates in local time
      const expectedStartDate = new Date('2023-06-11T00:00:00'); // Sunday
      const expectedEndDate = new Date('2023-06-17T23:59:59.999'); // Saturday
      
      expect(result.startDate).toEqual(expectedStartDate);
      expect(result.endDate).toEqual(expectedEndDate);
    });

    it('should calculate correct date range for month view', () => {
      const referenceDate = new Date('2023-06-15T12:00:00');
      const result = service.calculateDateRange(CalendarViewType.MONTH, referenceDate);
      
      // Create expected dates in local time
      const expectedStartDate = new Date('2023-06-01T00:00:00');
      const expectedEndDate = new Date('2023-06-30T23:59:59.999');
      
      expect(result.startDate).toEqual(expectedStartDate);
      expect(result.endDate).toEqual(expectedEndDate);
    });
  });

  describe('calculateDayRange', () => {
    it('should calculate correct day range', () => {
      const date = new Date('2023-06-15T12:00:00');
      const result = (service as any).calculateDayRange(date);
      
      // Create expected dates in local time
      const expectedStartDate = new Date('2023-06-15T00:00:00');
      const expectedEndDate = new Date('2023-06-15T23:59:59.999');
      
      expect(result.startDate).toEqual(expectedStartDate);
      expect(result.endDate).toEqual(expectedEndDate);
    });
  });

  describe('calculateWeekRange', () => {
    it('should calculate correct week range starting on Sunday', () => {
      const date = new Date('2023-06-15T12:00:00'); // Thursday
      const result = (service as any).calculateWeekRange(date);
      
      // Create expected dates in local time
      const expectedStartDate = new Date('2023-06-11T00:00:00'); // Sunday
      const expectedEndDate = new Date('2023-06-17T23:59:59.999'); // Saturday
      
      expect(result.startDate).toEqual(expectedStartDate);
      expect(result.endDate).toEqual(expectedEndDate);
    });
  });

  describe('calculateMonthRange', () => {
    it('should calculate correct month range', () => {
      const date = new Date('2023-06-15T12:00:00');
      const result = (service as any).calculateMonthRange(date);
      
      // Create expected dates in local time
      const expectedStartDate = new Date('2023-06-01T00:00:00');
      const expectedEndDate = new Date('2023-06-30T23:59:59.999');
      
      expect(result.startDate).toEqual(expectedStartDate);
      expect(result.endDate).toEqual(expectedEndDate);
    });

    it('should handle February correctly in leap year', () => {
      const date = new Date('2024-02-15T12:00:00');
      const result = (service as any).calculateMonthRange(date);
      
      // Create expected dates in local time
      const expectedStartDate = new Date('2024-02-01T00:00:00');
      const expectedEndDate = new Date('2024-02-29T23:59:59.999');
      
      expect(result.startDate).toEqual(expectedStartDate);
      expect(result.endDate).toEqual(expectedEndDate);
    });

    it('should handle February correctly in non-leap year', () => {
      const date = new Date('2023-02-15T12:00:00');
      const result = (service as any).calculateMonthRange(date);
      
      // Create expected dates in local time
      const expectedStartDate = new Date('2023-02-01T00:00:00');
      const expectedEndDate = new Date('2023-02-28T23:59:59.999');
      
      expect(result.startDate).toEqual(expectedStartDate);
      expect(result.endDate).toEqual(expectedEndDate);
    });
  });
});