import { validate } from 'class-validator';
import { CreateUserAvailabilityDto } from './create-user-availability.dto';

describe('CreateUserAvailabilityDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = new CreateUserAvailabilityDto();
    dto.startTime = new Date().toISOString();
    dto.endTime = new Date(Date.now() + 3600000).toISOString();
    dto.status = 'available';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should not validate an invalid startTime', async () => {
    const dto = new CreateUserAvailabilityDto();
    dto.startTime = 'invalid-date';
    dto.endTime = new Date(Date.now() + 3600000).toISOString();
    dto.status = 'available';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('startTime');
  });

  it('should not validate an invalid endTime', async () => {
    const dto = new CreateUserAvailabilityDto();
    dto.startTime = new Date().toISOString();
    dto.endTime = 'invalid-date';
    dto.status = 'available';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('endTime');
  });

  it('should not validate an invalid status', async () => {
    const dto = new CreateUserAvailabilityDto();
    dto.startTime = new Date().toISOString();
    dto.endTime = new Date(Date.now() + 3600000).toISOString();
    dto.status = 'invalid' as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
  });

  it('should validate an optional note', async () => {
    const dto = new CreateUserAvailabilityDto();
    dto.startTime = new Date().toISOString();
    dto.endTime = new Date(Date.now() + 3600000).toISOString();
    dto.status = 'available';
    dto.note = 'This is a valid note';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should not validate a note that is too long', async () => {
    const dto = new CreateUserAvailabilityDto();
    dto.startTime = new Date().toISOString();
    dto.endTime = new Date(Date.now() + 3600000).toISOString();
    dto.status = 'available';
    dto.note = 'a'.repeat(501); // Exceeds the 500 character limit

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('note');
  });
});