import { Test, TestingModule } from '@nestjs/testing';
import { MobileOptimizationService } from './mobile-optimization.service';
import { TimeBlock } from '../entities/time-block.entity';
import { CalendarViewType } from '../dto/calendar-view.dto';
import { Task } from '../../tasks/entities/task.entity';

describe('MobileOptimizationService', () => {
  let service: MobileOptimizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MobileOptimizationService],
    }).compile();

    service = module.get<MobileOptimizationService>(MobileOptimizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('optimizeForMobile', () => {
    it('should return full data for non-mobile devices', () => {
      const timeBlocks: TimeBlock[] = [];
      
      for (let i = 0; i < 5; i++) {
        const timeBlock = new TimeBlock();
        timeBlock.id = `id-${i}`;
        timeBlock.title = `Time Block ${i}`;
        timeBlock.description = `Description ${i}`;
        timeBlock.startTime = new Date(2023, 0, 1, i, 0, 0);
        timeBlock.endTime = new Date(2023, 0, 1, i + 1, 0, 0);
        timeBlock.color = `#color${i}`;
        timeBlock.taskId = `task-${i}`;
        timeBlocks.push(timeBlock);
      }
      
      const result = service.optimizeForMobile(timeBlocks, false);
      
      expect(result.length).toBe(5);
      // Should include description for non-mobile
      expect(result[0].hasOwnProperty('description')).toBeTruthy();
    });

    it('should reduce data for mobile devices', () => {
      const timeBlocks: TimeBlock[] = [];
      
      for (let i = 0; i < 5; i++) {
        const timeBlock = new TimeBlock();
        timeBlock.id = `id-${i}`;
        timeBlock.title = `Time Block ${i}`;
        timeBlock.description = `Description ${i}`;
        timeBlock.startTime = new Date(2023, 0, 1, i, 0, 0);
        timeBlock.endTime = new Date(2023, 0, 1, i + 1, 0, 0);
        timeBlock.color = `#color${i}`;
        timeBlock.taskId = `task-${i}`;
        timeBlocks.push(timeBlock);
      }
      
      const result = service.optimizeForMobile(timeBlocks, true);
      
      expect(result.length).toBe(5);
      // Should omit description for mobile
      expect(result[0].hasOwnProperty('description')).toBeFalsy();
    });
  });

  describe('reduceDataResolution', () => {
    it('should return full data for non-mobile devices', () => {
      const timeBlocks: TimeBlock[] = [];
      
      for (let i = 0; i < 5; i++) {
        const timeBlock = new TimeBlock();
        timeBlock.id = `id-${i}`;
        timeBlock.title = `Time Block ${i}`;
        timeBlock.description = `Description ${i}`;
        timeBlock.startTime = new Date(2023, 0, 1, i, 0, 0);
        timeBlock.endTime = new Date(2023, 0, 1, i + 1, 0, 0);
        timeBlock.color = `#color${i}`;
        timeBlock.taskId = `task-${i}`;
        timeBlocks.push(timeBlock);
      }
      
      const result = service.reduceDataResolution(timeBlocks, CalendarViewType.DAY, false);
      
      expect(result.length).toBe(5);
    });

    it('should aggregate by day for mobile month view', () => {
      const timeBlocks: TimeBlock[] = [];
      
      // Add multiple time blocks on the same day
      for (let i = 0; i < 5; i++) {
        const timeBlock = new TimeBlock();
        timeBlock.id = `id-${i}`;
        timeBlock.title = `Time Block ${i}`;
        timeBlock.startTime = new Date(2023, 0, 1, i, 0, 0);
        timeBlock.endTime = new Date(2023, 0, 1, i + 1, 0, 0);
        timeBlock.color = '#007bff';
        timeBlocks.push(timeBlock);
      }
      
      const result = service.reduceDataResolution(timeBlocks, CalendarViewType.MONTH, true);
      
      // Should have aggregated results (one per day)
      expect(result.length).toBe(1);
      expect(result[0].title).toContain('5 events');
    });

    it('should limit items for mobile week view', () => {
      const timeBlocks: TimeBlock[] = [];
      
      // Add more than 50 time blocks
      for (let i = 0; i < 60; i++) {
        const timeBlock = new TimeBlock();
        timeBlock.id = `id-${i}`;
        timeBlock.title = `Time Block ${i}`;
        timeBlock.startTime = new Date(2023, 0, 1, i % 24, 0, 0);
        timeBlock.endTime = new Date(2023, 0, 1, (i % 24) + 1, 0, 0);
        timeBlocks.push(timeBlock);
      }
      
      const result = service.reduceDataResolution(timeBlocks, CalendarViewType.WEEK, true);
      
      // Should limit to 50 items
      expect(result.length).toBe(50);
    });
  });

  describe('optimizeForLowMemory', () => {
    it('should limit the number of items', () => {
      const timeBlocks: TimeBlock[] = [];
      
      // Add more than 30 time blocks
      for (let i = 0; i < 40; i++) {
        const timeBlock = new TimeBlock();
        timeBlock.id = `id-${i}`;
        timeBlock.title = `Time Block ${i}`;
        timeBlock.startTime = new Date(2023, 0, 1, i % 24, 0, 0);
        timeBlock.endTime = new Date(2023, 0, 1, (i % 24) + 1, 0, 0);
        timeBlocks.push(timeBlock);
      }
      
      const result = service.optimizeForLowMemory(timeBlocks, 30);
      
      // Should limit to 30 items
      expect(result.length).toBe(30);
    });

    it('should return minimal data structure', () => {
      const timeBlocks: TimeBlock[] = [];
      
      const task = new Task();
      task.id = 'task-1';
      task.title = 'Test Task';
      
      const timeBlock = new TimeBlock();
      timeBlock.id = 'id-1';
      timeBlock.title = 'Time Block 1';
      timeBlock.description = 'Description 1';
      timeBlock.startTime = new Date(2023, 0, 1, 10, 0, 0);
      timeBlock.endTime = new Date(2023, 0, 1, 11, 0, 0);
      timeBlock.color = '#007bff';
      timeBlock.taskId = 'task-1';
      timeBlock.task = task;
      timeBlocks.push(timeBlock);
      
      const result = service.optimizeForLowMemory(timeBlocks, 10);
      
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('startTime');
      expect(result[0]).toHaveProperty('endTime');
      expect(result[0]).toHaveProperty('color');
      expect(result[0]).toHaveProperty('taskId');
      expect(result[0]).toHaveProperty('taskTitle');
      // Should not include description
      expect(result[0]).not.toHaveProperty('description');
    });
  });

  describe('compressTimeBlocks and decompressTimeBlocks', () => {
    it('should compress and decompress time blocks', () => {
      const timeBlocks = [
        {
          id: 'id-1',
          title: 'Time Block 1',
          startTime: new Date(2023, 0, 1, 10, 0, 0),
          endTime: new Date(2023, 0, 1, 11, 0, 0),
          color: '#007bff',
          taskId: 'task-1',
          taskTitle: 'Test Task'
        }
      ];
      
      const compressed = service.compressTimeBlocks(timeBlocks);
      const decompressed = service.decompressTimeBlocks(compressed);
      
      // Compare individual properties to handle date serialization differences
      expect(decompressed.length).toBe(1);
      expect(decompressed[0].id).toBe(timeBlocks[0].id);
      expect(decompressed[0].title).toBe(timeBlocks[0].title);
      expect(decompressed[0].color).toBe(timeBlocks[0].color);
      expect(decompressed[0].taskId).toBe(timeBlocks[0].taskId);
      expect(decompressed[0].taskTitle).toBe(timeBlocks[0].taskTitle);
      
      // Compare dates by their string representation
      // After JSON serialization/deserialization, dates become strings, so we need to convert them back
      expect(new Date(decompressed[0].startTime).toISOString()).toBe(timeBlocks[0].startTime.toISOString());
      expect(new Date(decompressed[0].endTime).toISOString()).toBe(timeBlocks[0].endTime.toISOString());
    });
  });
});