import { Test, TestingModule } from '@nestjs/testing';
import { VirtualScrollingService } from './virtual-scrolling.service';
import { TimeBlock } from '../entities/time-block.entity';

describe('VirtualScrollingService', () => {
  let service: VirtualScrollingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VirtualScrollingService],
    }).compile();

    service = module.get<VirtualScrollingService>(VirtualScrollingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('applyVirtualScrolling', () => {
    it('should paginate time blocks correctly', () => {
      const timeBlocks = Array.from({ length: 100 }, (_, i) => {
        const timeBlock = new TimeBlock();
        timeBlock.id = `id-${i}`;
        timeBlock.title = `Time Block ${i}`;
        timeBlock.startTime = new Date(2023, 5, 15, 9, 0, 0);
        timeBlock.endTime = new Date(2023, 5, 15, 10, 0, 0);
        return timeBlock;
      });

      const result = service.applyVirtualScrolling(timeBlocks, 1, 10);
      
      expect(result.timeBlocks).toHaveLength(10);
      expect(result.total).toBe(100);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(10);
    });

    it('should handle page beyond total pages', () => {
      const timeBlocks = Array.from({ length: 5 }, (_, i) => {
        const timeBlock = new TimeBlock();
        timeBlock.id = `id-${i}`;
        timeBlock.title = `Time Block ${i}`;
        timeBlock.startTime = new Date(2023, 5, 15, 9, 0, 0);
        timeBlock.endTime = new Date(2023, 5, 15, 10, 0, 0);
        return timeBlock;
      });

      const result = service.applyVirtualScrolling(timeBlocks, 10, 10);
      
      expect(result.timeBlocks).toHaveLength(5);
      expect(result.page).toBe(1); // Should default to last valid page
      expect(result.totalPages).toBe(1);
    });

    it('should handle empty time blocks array', () => {
      const timeBlocks: TimeBlock[] = [];
      
      const result = service.applyVirtualScrolling(timeBlocks, 1, 10);
      
      expect(result.timeBlocks).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(0); // With 0 items, there are 0 pages
    });
  });

  describe('applyAdvancedVirtualScrolling', () => {
    it('should filter time blocks by search term', () => {
      const timeBlocks = [
        createTimeBlock('1', 'Meeting with John', new Date(2023, 5, 15, 9, 0, 0), new Date(2023, 5, 15, 10, 0, 0)),
        createTimeBlock('2', 'Lunch break', new Date(2023, 5, 15, 12, 0, 0), new Date(2023, 5, 15, 13, 0, 0)),
        createTimeBlock('3', 'Team meeting', new Date(2023, 5, 15, 14, 0, 0), new Date(2023, 5, 15, 15, 0, 0)),
      ];

      const result = service.applyAdvancedVirtualScrolling(timeBlocks, {
        page: 1,
        limit: 10,
        search: 'meeting'
      });
      
      expect(result.timeBlocks).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should sort time blocks by title ascending', () => {
      const timeBlocks = [
        createTimeBlock('1', 'Zoo visit', new Date(2023, 5, 15, 9, 0, 0), new Date(2023, 5, 15, 10, 0, 0)),
        createTimeBlock('2', 'Apple picking', new Date(2023, 5, 15, 12, 0, 0), new Date(2023, 5, 15, 13, 0, 0)),
        createTimeBlock('3', 'Banana split', new Date(2023, 5, 15, 14, 0, 0), new Date(2023, 5, 15, 15, 0, 0)),
      ];

      const result = service.applyAdvancedVirtualScrolling(timeBlocks, {
        page: 1,
        limit: 10,
        sortBy: 'title',
        sortOrder: 'asc'
      });
      
      expect(result.timeBlocks[0].title).toBe('Apple picking');
      expect(result.timeBlocks[1].title).toBe('Banana split');
      expect(result.timeBlocks[2].title).toBe('Zoo visit');
    });

    it('should sort time blocks by start time descending', () => {
      const timeBlocks = [
        createTimeBlock('1', 'Morning meeting', new Date(2023, 5, 15, 9, 0, 0), new Date(2023, 5, 15, 10, 0, 0)),
        createTimeBlock('2', 'Lunch', new Date(2023, 5, 15, 12, 0, 0), new Date(2023, 5, 15, 13, 0, 0)),
        createTimeBlock('3', 'Evening event', new Date(2023, 5, 15, 18, 0, 0), new Date(2023, 5, 15, 19, 0, 0)),
      ];

      const result = service.applyAdvancedVirtualScrolling(timeBlocks, {
        page: 1,
        limit: 10,
        sortBy: 'startTime',
        sortOrder: 'desc'
      });
      
      expect(result.timeBlocks[0].title).toBe('Evening event');
      expect(result.timeBlocks[1].title).toBe('Lunch');
      expect(result.timeBlocks[2].title).toBe('Morning meeting');
    });

    it('should combine filtering and pagination', () => {
      const timeBlocks = Array.from({ length: 100 }, (_, i) => {
        const timeBlock = new TimeBlock();
        timeBlock.id = `id-${i}`;
        timeBlock.title = i % 2 === 0 ? `Even Task ${i}` : `Odd Task ${i}`;
        timeBlock.startTime = new Date(2023, 5, 15, 9, 0, 0);
        timeBlock.endTime = new Date(2023, 5, 15, 10, 0, 0);
        return timeBlock;
      });

      const result = service.applyAdvancedVirtualScrolling(timeBlocks, {
        page: 2,
        limit: 10,
        search: 'Even'
      });
      
      expect(result.timeBlocks).toHaveLength(10);
      expect(result.total).toBe(50); // 50 even tasks
      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(5);
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