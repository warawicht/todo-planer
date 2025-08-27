import { TimeBlock } from './time-block.entity';
import { User } from '../../users/user.entity';

describe('TimeBlock', () => {
  it('should be defined', () => {
    expect(new TimeBlock()).toBeDefined();
  });
});