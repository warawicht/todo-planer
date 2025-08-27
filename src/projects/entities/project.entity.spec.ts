import { Project } from './project.entity';
import { User } from '../../../users/user.entity';

describe('Project', () => {
  it('should be defined', () => {
    const project = new Project();
    expect(project).toBeDefined();
  });

  it('should have required properties', () => {
    const project = new Project();
    project.name = 'Test Project';
    project.isArchived = false;
    
    expect(project.name).toBe('Test Project');
    expect(project.isArchived).toBe(false);
  });

  it('should have relationships', () => {
    const project = new Project();
    const user = new User();
    
    project.user = user;
    expect(project.user).toBeInstanceOf(User);
  });
});