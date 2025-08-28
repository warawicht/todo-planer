import { Test, TestingModule } from '@nestjs/testing';
import { LazyLoadingService } from './lazy-loading.service';
import { TimeBlock } from '../entities/time-block.entity';
import { CalendarViewType } from '../dto/calendar-view.dto';
import { CalendarTimeBlockDto } from '../dto/calendar-time-block.dto';

describe('LazyLoadingService', () => {
  let service: LazyLoadingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LazyLoadingService],
    }).compile();

    service = module.get<LazyLoadingService>(LazyLoadingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loadTimeBlocksIncrementally', () => {
    it('should yield batches of time blocks', () => {
      // Create test time blocks
      const timeBlocks: TimeBlock[] = [];
      for (let i = 0; i < 50; i++) {
        const timeBlock = new TimeBlock();
        timeBlock.id = `id-${i}`;
        timeBlock.title = `Time Block ${i}`;
        timeBlock.startTime = new Date(2023, 0, 1, i, 0, 0);
        timeBlock.endTime = new Date(2023, 0, 1, i + 1, 0, 0);
        timeBlocks.push(timeBlock);
      }
      
      const viewportStartDate = new Date(2023, 0, 1, 10, 0, 0);
      const viewportEndDate = new Date(2023, 0, 1, 15, 0, 0);
      
      const generator = service.loadTimeBlocksIncrementally(timeBlocks, viewportStartDate, viewportEndDate, 10);
      const batches = Array.from(generator);
      
      expect(batches.length).toBeGreaterThan(0);
      expect(batches[0].length).toBe(10);
    });

    it('should prioritize viewport items', () => {
      // Create test time blocks with some in viewport and some outside
      const timeBlocks: TimeBlock[] = [];
      
      // Add time blocks outside viewport (early in day)
      for (let i = 0; i < 5; i++) {
        const timeBlock = new TimeBlock();
        timeBlock.id = `outside-${i}`;
        timeBlock.title = `Outside Viewport ${i}`;
        timeBlock.startTime = new Date(2023, 0, 1, i, 0, 0);
        timeBlock.endTime = new Date(2023, 0, 1, i + 1, 0, 0);
        timeBlocks.push(timeBlock);
      }
      
      // Add time blocks in viewport
      for (let i = 10; i < 15; i++) {
        const timeBlock = new TimeBlock();
        timeBlock.id = `inside-${i}`;
        timeBlock.title = `In Viewport ${i}`;
        timeBlock.startTime = new Date(2023, 0, 1, i, 0, 0);
        timeBlock.endTime = new Date(2023, 0, 1, i + 1, 0, 0);
        timeBlocks.push(timeBlock);
      }
      
      // Add time blocks outside viewport (later in day)
      for (let i = 20; i < 25; i++) {
        const timeBlock = new TimeBlock();
        timeBlock.id = `outside-later-${i}`;
        timeBlock.title = `Outside Viewport Later ${i}`;
        timeBlock.startTime = new Date(2023, 0, 1, i, 0, 0);
        timeBlock.endTime = new Date(2023, 0, 1, i + 1, 0, 0);
        timeBlocks.push(timeBlock);
      }
      
      const viewportStartDate = new Date(2023, 0, 1, 9, 0, 0);
      const viewportEndDate = new Date(2023, 0, 1, 19, 0, 0);
      
      const generator = service.loadTimeBlocksIncrementally(timeBlocks, viewportStartDate, viewportEndDate, 20);
      const batches = Array.from(generator);
      
      expect(batches.length).toBeGreaterThan(0);
      // Should have 15 items total (all items since batch size is 20)
      const firstBatch = batches[0];
      expect(firstBatch.length).toBe(15);
    });
  });

  describe('loadTimeBlocksWithProgressiveEnhancement', () => {
    it('should separate time blocks into primary and secondary', () => {
      const timeBlocks: TimeBlock[] = [];
      
      // Add time blocks in viewport
      for (let i = 10; i < 15; i++) {
        const timeBlock = new TimeBlock();
        timeBlock.id = `inside-${i}`;
        timeBlock.title = `In Viewport ${i}`;
        timeBlock.startTime = new Date(2023, 0, 1, i, 0, 0);
        timeBlock.endTime = new Date(2023, 0, 1, i + 1, 0, 0);
        timeBlocks.push(timeBlock);
      }
      
      // Add time blocks outside viewport
      for (let i = 20; i < 25; i++) {
        const timeBlock = new TimeBlock();
        timeBlock.id = `outside-${i}`;
        timeBlock.title = `Outside Viewport ${i}`;
        timeBlock.startTime = new Date(2023, 0, 1, i, 0, 0);
        timeBlock.endTime = new Date(2023, 0, 1, i + 1, 0, 0);
        timeBlocks.push(timeBlock);
      }
      
      const viewportStartDate = new Date(2023, 0, 1, 9, 0, 0);
      const viewportEndDate = new Date(2023, 0, 1, 19, 0, 0);
      
      const result = service.loadTimeBlocksWithProgressiveEnhancement(timeBlocks, viewportStartDate, viewportEndDate);
      
      expect(result.primaryTimeBlocks.length).toBe(5);
      expect(result.secondaryTimeBlocks.length).toBe(5);
      
      // Check that primary time blocks are the ones in viewport
      result.primaryTimeBlocks.forEach(tb => {
        expect(tb.title).toContain('In Viewport');
      });
      
      // Check that secondary time blocks are the ones outside viewport
      result.secondaryTimeBlocks.forEach(tb => {
        expect(tb.title).toContain('Outside Viewport');
      });
    });
  });

  describe('loadTimeBlocksWithLevelOfDetail', () => {
    it('should return all time blocks for normal zoom level', () => {
      const timeBlocks: TimeBlock[] = [];
      
      for (let i = 0; i < 10; i++) {
        const timeBlock = new TimeBlock();
        timeBlock.id = `id-${i}`;
        timeBlock.title = `Time Block ${i}`;
        timeBlock.startTime = new Date(2023, 0, 1, i, 0, 0);
        timeBlock.endTime = new Date(2023, 0, 1, i + 1, 0, 0);
        timeBlocks.push(timeBlock);
      }
      
      const result = service.loadTimeBlocksWithLevelOfDetail(timeBlocks, CalendarViewType.DAY, 1);
      
      expect(result.length).toBe(10);
    });

    it('should aggregate time blocks for highly zoomed out month view', () => {
      const timeBlocks: TimeBlock[] = [];
      
      // Add multiple time blocks on the same day
      for (let i = 0; i < 5; i++) {
        const timeBlock = new TimeBlock();
        timeBlock.id = `id-${i}`;
        timeBlock.title = `Time Block ${i}`;
        timeBlock.startTime = new Date(2023, 0, 1, i, 0, 0);
        timeBlock.endTime = new Date(2023, 0, 1, i + 1, 0, 0);
        timeBlocks.push(timeBlock);
      }
      
      // Add time blocks on a different day
      for (let i = 0; i < 3; i++) {
        const timeBlock = new TimeBlock();
        timeBlock.id = `id-later-${i}`;
        timeBlock.title = `Time Block Later ${i}`;
        timeBlock.startTime = new Date(2023, 0, 2, i, 0, 0);
        timeBlock.endTime = new Date(2023, 0, 2, i + 1, 0, 0);
        timeBlocks.push(timeBlock);
      }
      
      const result = service.loadTimeBlocksWithLevelOfDetail(timeBlocks, CalendarViewType.MONTH, 0.3);
      
      // Should have aggregated results (one per day)
      expect(result.length).toBe(2);
      expect(result[0].title).toContain('5 events');
      expect(result[1].title).toContain('3 events');
    });
  });
});