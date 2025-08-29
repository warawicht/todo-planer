import { validate } from 'class-validator';
import { CreateTaskAssignmentDto } from './create-task-assignment.dto';

describe('CreateTaskAssignmentDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = new CreateTaskAssignmentDto();
    dto.assignedToId = '123e4567-e89b-12d3-a456-426614174000';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should not validate an invalid assignedToId', async () => {
    const dto = new CreateTaskAssignmentDto();
    dto.assignedToId = 'invalid-uuid';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('assignedToId');
  });

  it('should not validate an empty DTO', async () => {
    const dto = new CreateTaskAssignmentDto();

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(error => error.property === 'assignedToId')).toBeTruthy();
  });
});