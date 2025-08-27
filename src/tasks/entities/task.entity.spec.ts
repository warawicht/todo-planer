import { Task } from './task.entity';
import { User } from '../../../users/user.entity';

describe('Task', () => {
  it('should be defined', () => {
    const task = new Task();
    expect(task).toBeDefined();
  });

  it('should have required properties', () => {
    const task = new Task();
    task.title = 'Test Task';
    task.priority = 1;
    task.status = 'pending';
    
    expect(task.title).toBe('Test Task');
    expect(task.priority).toBe(1);
    expect(task.status).toBe('pending');
  });

  it('should have relationships', () => {
    const task = new Task();
    const user = new User();
    
    task.user = user;
    expect(task.user).toBeInstanceOf(User);
  });
});