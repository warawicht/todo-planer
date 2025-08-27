import { Tag } from './tag.entity';
import { User } from '../../../users/user.entity';

describe('Tag', () => {
  it('should be defined', () => {
    const tag = new Tag();
    expect(tag).toBeDefined();
  });

  it('should have required properties', () => {
    const tag = new Tag();
    tag.name = 'Test Tag';
    
    expect(tag.name).toBe('Test Tag');
  });

  it('should have relationships', () => {
    const tag = new Tag();
    const user = new User();
    
    tag.user = user;
    expect(tag.user).toBeInstanceOf(User);
  });
});