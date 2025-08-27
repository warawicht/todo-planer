import { Tag } from './tag.entity';
import { User } from '../../users/user.entity';

describe('Tag', () => {
  it('should be defined', () => {
    expect(new Tag()).toBeDefined();
  });
});