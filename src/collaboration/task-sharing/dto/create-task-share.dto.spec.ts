import { validate } from 'class-validator';
import { CreateTaskShareDto } from './create-task-share.dto';

describe('CreateTaskShareDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = new CreateTaskShareDto();
    dto.sharedWithId = '123e4567-e89b-12d3-a456-426614174000';
    dto.permissionLevel = 'view';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should not validate an invalid sharedWithId', async () => {
    const dto = new CreateTaskShareDto();
    dto.sharedWithId = 'invalid-uuid';
    dto.permissionLevel = 'view';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('sharedWithId');
  });

  it('should not validate an invalid permissionLevel', async () => {
    const dto = new CreateTaskShareDto();
    dto.sharedWithId = '123e4567-e89b-12d3-a456-426614174000';
    dto.permissionLevel = 'invalid' as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('permissionLevel');
  });

  it('should not validate an empty DTO', async () => {
    const dto = new CreateTaskShareDto();

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(error => error.property === 'sharedWithId')).toBeTruthy();
  });
});