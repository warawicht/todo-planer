import { validate } from 'class-validator';
import { CreateTaskCommentDto } from './create-task-comment.dto';

describe('CreateTaskCommentDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = new CreateTaskCommentDto();
    dto.content = 'This is a valid comment';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should not validate an empty content', async () => {
    const dto = new CreateTaskCommentDto();
    dto.content = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('content');
  });

  it('should not validate content that is too long', async () => {
    const dto = new CreateTaskCommentDto();
    dto.content = 'a'.repeat(2001); // Exceeds the 2000 character limit

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('content');
  });

  it('should validate an optional parentId', async () => {
    const dto = new CreateTaskCommentDto();
    dto.content = 'This is a valid comment';
    dto.parentId = '123e4567-e89b-12d3-a456-426614174000';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should not validate an invalid parentId', async () => {
    const dto = new CreateTaskCommentDto();
    dto.content = 'This is a valid comment';
    dto.parentId = 'invalid-uuid';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('parentId');
  });
});