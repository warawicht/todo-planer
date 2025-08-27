import { TimeBlock } from './time-block.entity';
import { User } from '../../../users/user.entity';

describe('TimeBlock', () => {
  it('should be defined', () => {
    const timeBlock = new TimeBlock();
    expect(timeBlock).toBeDefined();
  });

  it('should have required properties', () => {
    const timeBlock = new TimeBlock();
    timeBlock.title = 'Test Time Block';
    const now = new Date();
    timeBlock.startTime = now;
    timeBlock.endTime = new Date(now.getTime() + 3600000); // 1 hour later
    
    expect(timeBlock.title).toBe('Test Time Block');
    expect(timeBlock.startTime).toBe(now);
    expect(timeBlock.endTime).toBeInstanceOf(Date);
  });

  it('should have relationships', () => {
    const timeBlock = new TimeBlock();
    const user = new User();
    
    timeBlock.user = user;
    expect(timeBlock.user).toBeInstanceOf(User);
  });
});