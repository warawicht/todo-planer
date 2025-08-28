import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeBlocksService } from './time-blocks.service';
import { TimeBlock } from './entities/time-block.entity';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';
import { UpdateTimeBlockDto } from './dto/update-time-block.dto';
import { TimeBlockConflictException } from './exceptions/time-block-conflict.exception';
import { CalendarViewType } from './dto/calendar-view.dto';
import { DateRangeCalculatorService } from './services/date-range-calculator.service';
import { CalendarDataAggregatorService } from './services/calendar-data-aggregator.service';
import { CalendarCacheService } from './services/calendar-cache.service';
import { VirtualScrollingService } from './services/virtual-scrolling.service';
import { PerformanceMonitoringService } from './services/performance-monitoring.service';

const mockTimeBlockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  })),
};

describe('TimeBlocksService', () => {
  let service: TimeBlocksService;
  let repository: Repository<TimeBlock>;
  let dateRangeCalculatorService: DateRangeCalculatorService;
  let calendarDataAggregatorService: CalendarDataAggregatorService;
  let calendarCacheService: CalendarCacheService;
  let virtualScrollingService: VirtualScrollingService;
  let performanceMonitoringService: PerformanceMonitoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeBlocksService,
        {
          provide: getRepositoryToken(TimeBlock),
          useValue: mockTimeBlockRepository,
        },
        {
          provide: DateRangeCalculatorService,
          useValue: {
            calculateDateRange: jest.fn(),
          },
        },
        {
          provide: CalendarDataAggregatorService,
          useValue: {
            aggregateTimeBlocks: jest.fn(),
          },
        },
        {
          provide: CalendarCacheService,
          useValue: {
            getCalendarView: jest.fn(),
            setCalendarView: jest.fn(),
            clearUserCache: jest.fn(),
          },
        },
        {
          provide: VirtualScrollingService,
          useValue: {
            applyVirtualScrolling: jest.fn(),
          },
        },
        {
          provide: PerformanceMonitoringService,
          useValue: {
            startMeasurement: jest.fn(() => Date.now()),
            endMeasurement: jest.fn(),
            logMemoryUsage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TimeBlocksService>(TimeBlocksService);
    repository = module.get<Repository<TimeBlock>>(getRepositoryToken(TimeBlock));
    dateRangeCalculatorService = module.get<DateRangeCalculatorService>(DateRangeCalculatorService);
    calendarDataAggregatorService = module.get<CalendarDataAggregatorService>(CalendarDataAggregatorService);
    calendarCacheService = module.get<CalendarCacheService>(CalendarCacheService);
    virtualScrollingService = module.get<VirtualScrollingService>(VirtualScrollingService);
    performanceMonitoringService = module.get<PerformanceMonitoringService>(PerformanceMonitoringService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a time block successfully', async () => {
      const userId = 'user-id';
      const createTimeBlockDto: CreateTimeBlockDto = {
        title: 'Test Time Block',
        startTime: '2023-01-01T09:00:00Z',
        endTime: '2023-01-01T10:00:00Z',
      };

      const timeBlock = new TimeBlock();
      Object.assign(timeBlock, { ...createTimeBlockDto, userId });

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      
      mockTimeBlockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockTimeBlockRepository.create.mockReturnValue(timeBlock);
      mockTimeBlockRepository.save.mockResolvedValue(timeBlock);

      const result = await service.create(userId, createTimeBlockDto);

      expect(result).toEqual(timeBlock);
      expect(repository.create).toHaveBeenCalledWith({
        ...createTimeBlockDto,
        startTime: new Date(createTimeBlockDto.startTime),
        endTime: new Date(createTimeBlockDto.endTime),
        userId,
      });
      expect(repository.save).toHaveBeenCalledWith(timeBlock);
    });

    it('should throw TimeBlockConflictException when conflicts exist', async () => {
      const userId = 'user-id';
      const createTimeBlockDto: CreateTimeBlockDto = {
        title: 'Test Time Block',
        startTime: '2023-01-01T09:00:00Z',
        endTime: '2023-01-01T10:00:00Z',
      };

      const conflictingTimeBlock = new TimeBlock();
      conflictingTimeBlock.id = 'conflict-id';
      conflictingTimeBlock.title = 'Conflicting Block';
      conflictingTimeBlock.startTime = new Date('2023-01-01T09:30:00Z');
      conflictingTimeBlock.endTime = new Date('2023-01-01T10:30:00Z');

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([conflictingTimeBlock]),
      };
      
      mockTimeBlockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.create(userId, createTimeBlockDto)).rejects.toThrow(
        TimeBlockConflictException,
      );
    });

    it('should throw BadRequestException for invalid time range', async () => {
      const userId = 'user-id';
      const createTimeBlockDto: CreateTimeBlockDto = {
        title: 'Test Time Block',
        startTime: '2023-01-01T10:00:00Z',
        endTime: '2023-01-01T09:00:00Z', // End time before start time
      };

      await expect(service.create(userId, createTimeBlockDto)).rejects.toThrow(
        'End time must be after start time',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of time blocks', async () => {
      const userId = 'user-id';
      const timeBlocks = [
        new TimeBlock(),
        new TimeBlock(),
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(timeBlocks),
      };
      
      mockTimeBlockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(userId);

      expect(result).toEqual(timeBlocks);
    });
  });

  describe('findOne', () => {
    it('should return a time block by id', async () => {
      const userId = 'user-id';
      const id = 'time-block-id';
      const timeBlock = new TimeBlock();
      timeBlock.id = id;

      mockTimeBlockRepository.findOne.mockResolvedValue(timeBlock);

      const result = await service.findOne(userId, id);

      expect(result).toEqual(timeBlock);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id, userId } });
    });

    it('should throw NotFoundException when time block is not found', async () => {
      const userId = 'user-id';
      const id = 'non-existent-id';

      mockTimeBlockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId, id)).rejects.toThrow('Time block not found');
    });
  });

  describe('update', () => {
    it('should update a time block successfully', async () => {
      const userId = 'user-id';
      const id = 'time-block-id';
      const updateTimeBlockDto: UpdateTimeBlockDto = {
        title: 'Updated Title',
      };

      const existingTimeBlock = new TimeBlock();
      existingTimeBlock.id = id;
      existingTimeBlock.title = 'Original Title';
      existingTimeBlock.startTime = new Date('2023-01-01T09:00:00Z');
      existingTimeBlock.endTime = new Date('2023-01-01T10:00:00Z');

      const updatedTimeBlock = new TimeBlock();
      Object.assign(updatedTimeBlock, { ...existingTimeBlock, ...updateTimeBlockDto });

      mockTimeBlockRepository.findOne.mockResolvedValue(existingTimeBlock);
      mockTimeBlockRepository.update.mockResolvedValue(undefined);
      mockTimeBlockRepository.findOne.mockResolvedValue(updatedTimeBlock);

      const result = await service.update(userId, id, updateTimeBlockDto);

      expect(result).toEqual(updatedTimeBlock);
    });

    it('should throw TimeBlockConflictException when update causes conflicts', async () => {
      const userId = 'user-id';
      const id = 'time-block-id';
      const updateTimeBlockDto: UpdateTimeBlockDto = {
        startTime: '2023-01-01T11:00:00Z',
        endTime: '2023-01-01T12:00:00Z',
      };

      const existingTimeBlock = new TimeBlock();
      existingTimeBlock.id = id;
      existingTimeBlock.title = 'Original Title';
      existingTimeBlock.startTime = new Date('2023-01-01T09:00:00Z');
      existingTimeBlock.endTime = new Date('2023-01-01T10:00:00Z');

      const conflictingTimeBlock = new TimeBlock();
      conflictingTimeBlock.id = 'conflict-id';
      conflictingTimeBlock.title = 'Conflicting Block';
      conflictingTimeBlock.startTime = new Date('2023-01-01T11:30:00Z');
      conflictingTimeBlock.endTime = new Date('2023-01-01T12:30:00Z');

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([conflictingTimeBlock]),
      };
      
      mockTimeBlockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockTimeBlockRepository.findOne.mockResolvedValue(existingTimeBlock);

      await expect(service.update(userId, id, updateTimeBlockDto)).rejects.toThrow(
        TimeBlockConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a time block successfully', async () => {
      const userId = 'user-id';
      const id = 'time-block-id';

      const existingTimeBlock = new TimeBlock();
      existingTimeBlock.id = id;

      mockTimeBlockRepository.findOne.mockResolvedValue(existingTimeBlock);
      mockTimeBlockRepository.delete.mockResolvedValue(undefined);

      await service.remove(userId, id);

      expect(repository.delete).toHaveBeenCalledWith({ id, userId });
    });

    it('should throw NotFoundException when trying to remove non-existent time block', async () => {
      const userId = 'user-id';
      const id = 'non-existent-id';

      mockTimeBlockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(userId, id)).rejects.toThrow('Time block not found');
    });
  });

  describe('getCalendarView', () => {
    it('should return cached calendar view data when available', async () => {
      const userId = 'user-id';
      const view = CalendarViewType.WEEK;
      const referenceDate = new Date('2023-06-15T00:00:00Z');
      
      const cachedResult = {
        view,
        referenceDate,
        startDate: new Date('2023-06-11T00:00:00Z'),
        endDate: new Date('2023-06-17T23:59:59.999Z'),
        timeBlocks: [],
      };
      
      jest.spyOn(calendarCacheService, 'getCalendarView').mockReturnValue(cachedResult);
      
      const result = await service.getCalendarView(userId, view, referenceDate);
      
      expect(result).toEqual(cachedResult);
      expect(calendarCacheService.getCalendarView).toHaveBeenCalledWith(userId, view, referenceDate);
    });

    it('should return calendar view data and cache it when not cached', async () => {
      const userId = 'user-id';
      const view = CalendarViewType.WEEK;
      const referenceDate = new Date('2023-06-15T00:00:00Z');
      const startDate = new Date('2023-06-11T00:00:00Z');
      const endDate = new Date('2023-06-17T23:59:59.999Z');
      
      const timeBlocks = [
        new TimeBlock(),
        new TimeBlock(),
      ];
      
      const calendarTimeBlocks = [
        // Mock calendar time blocks
      ];
      
      const expectedResult = {
        view,
        referenceDate,
        startDate,
        endDate,
        timeBlocks: calendarTimeBlocks,
      };
      
      // Mock the cache service to return null (no cache)
      jest.spyOn(calendarCacheService, 'getCalendarView').mockReturnValue(null);
      const setCalendarViewSpy = jest.spyOn(calendarCacheService, 'setCalendarView');
      
      // Mock the date range calculator
      jest.spyOn(dateRangeCalculatorService, 'calculateDateRange').mockReturnValue({ startDate, endDate });
      
      // Mock the calendar data aggregator
      jest.spyOn(calendarDataAggregatorService, 'aggregateTimeBlocks').mockReturnValue(calendarTimeBlocks);
      
      // Mock the virtual scrolling service
      jest.spyOn(virtualScrollingService, 'applyVirtualScrolling').mockReturnValue({
        timeBlocks: calendarTimeBlocks,
        total: 2,
        page: 1,
        limit: 100,
        totalPages: 1
      });
      
      // Mock the query builder
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(timeBlocks),
      };
      
      mockTimeBlockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      const result = await service.getCalendarView(userId, view, referenceDate);
      
      expect(result).toEqual(expectedResult);
      
      expect(dateRangeCalculatorService.calculateDateRange).toHaveBeenCalledWith(view, referenceDate);
      // Since we have less than 100 items, it should use the aggregator, not virtual scrolling
      expect(calendarDataAggregatorService.aggregateTimeBlocks).toHaveBeenCalledWith(
        timeBlocks,
        view,
        startDate,
        endDate
      );
      expect(setCalendarViewSpy).toHaveBeenCalledWith(
        userId,
        view,
        referenceDate,
        expectedResult
      );
    });

    it('should apply virtual scrolling for large datasets', async () => {
      const userId = 'user-id';
      const view = CalendarViewType.WEEK;
      const referenceDate = new Date('2023-06-15T00:00:00Z');
      const startDate = new Date('2023-06-11T00:00:00Z');
      const endDate = new Date('2023-06-17T23:59:59.999Z');
      
      // Create 150 time blocks to trigger virtual scrolling
      const timeBlocks = Array(150).fill(null).map(() => new TimeBlock());
      
      const paginatedTimeBlocks = [
        // Mock paginated calendar time blocks
      ];
      
      const expectedResult = {
        view,
        referenceDate,
        startDate,
        endDate,
        timeBlocks: paginatedTimeBlocks,
      };
      
      // Mock the cache service to return null (no cache)
      jest.spyOn(calendarCacheService, 'getCalendarView').mockReturnValue(null);
      const setCalendarViewSpy = jest.spyOn(calendarCacheService, 'setCalendarView');
      
      // Mock the date range calculator
      jest.spyOn(dateRangeCalculatorService, 'calculateDateRange').mockReturnValue({ startDate, endDate });
      
      // Mock the virtual scrolling service
      jest.spyOn(virtualScrollingService, 'applyVirtualScrolling').mockReturnValue({
        timeBlocks: paginatedTimeBlocks,
        total: 150,
        page: 1,
        limit: 100,
        totalPages: 2
      });
      
      // Mock the query builder
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(timeBlocks),
      };
      
      mockTimeBlockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      const result = await service.getCalendarView(userId, view, referenceDate);
      
      expect(result).toEqual(expectedResult);
      
      expect(dateRangeCalculatorService.calculateDateRange).toHaveBeenCalledWith(view, referenceDate);
      // Since we have more than 100 items, it should use virtual scrolling, not the aggregator
      expect(virtualScrollingService.applyVirtualScrolling).toHaveBeenCalledWith(
        timeBlocks,
        1,
        100
      );
      expect(setCalendarViewSpy).toHaveBeenCalledWith(
        userId,
        view,
        referenceDate,
        expectedResult
      );
    });
  });
});