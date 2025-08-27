import { Project } from './project.entity';
import { User } from '../../users/user.entity';

describe('Project', () => {
  it('should be defined', () => {
    expect(new Project()).toBeDefined();
  });
});