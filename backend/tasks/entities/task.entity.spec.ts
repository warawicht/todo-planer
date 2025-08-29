import { Task } from './task.entity';
import { User } from '../../users/user.entity';

describe('Task', () => {
  it('should be defined', () => {
    expect(new Task()).toBeDefined();
  });
});