import { validate } from 'class-validator';
import { TimeBlock } from './time-block.entity';

describe('TimeBlockEntity', () => {
  it('should be defined', () => {
    expect(new TimeBlock()).toBeDefined();
  });

  it('should validate a valid time block', async () => {
    const timeBlock = new TimeBlock();
    timeBlock.title = 'Valid Title';
    timeBlock.description = 'Valid description';
    timeBlock.startTime = new Date('2023-01-01T09:00:00Z');
    timeBlock.endTime = new Date('2023-01-01T10:00:00Z');
    timeBlock.color = '#FF0000';
    timeBlock.userId = 'user-id';
    timeBlock.taskId = 'task-id';

    const errors = await validate(timeBlock);
    expect(errors.length).toBe(0);
  });

  it('should validate title length constraints', async () => {
    const timeBlock = new TimeBlock();
    timeBlock.title = ''; // Too short
    timeBlock.startTime = new Date('2023-01-01T09:00:00Z');
    timeBlock.endTime = new Date('2023-01-01T10:00:00Z');
    timeBlock.userId = 'user-id';

    const errors = await validate(timeBlock);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
  });

  it('should validate description length constraints', async () => {
    const timeBlock = new TimeBlock();
    timeBlock.title = 'Valid Title';
    timeBlock.description = 'a'.repeat(501); // Too long
    timeBlock.startTime = new Date('2023-01-01T09:00:00Z');
    timeBlock.endTime = new Date('2023-01-01T10:00:00Z');
    timeBlock.userId = 'user-id';

    const errors = await validate(timeBlock);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(error => error.property === 'description')).toBe(true);
  });

  it('should validate color format', async () => {
    const timeBlock = new TimeBlock();
    timeBlock.title = 'Valid Title';
    timeBlock.startTime = new Date('2023-01-01T09:00:00Z');
    timeBlock.endTime = new Date('2023-01-01T10:00:00Z');
    timeBlock.color = 'invalid-color'; // Invalid hex format
    timeBlock.userId = 'user-id';

    const errors = await validate(timeBlock);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(error => error.property === 'color')).toBe(true);
  });

  it('should validate time order', async () => {
    const timeBlock = new TimeBlock();
    timeBlock.title = 'Valid Title';
    timeBlock.startTime = new Date('2023-01-01T10:00:00Z'); // Start after end
    timeBlock.endTime = new Date('2023-01-01T09:00:00Z');
    timeBlock.userId = 'user-id';

    // The validation happens in the @BeforeInsert and @BeforeUpdate hooks
    // We need to manually call the validateTime method
    expect(() => timeBlock.validateTime()).toThrow('End time must be after start time');
  });
});