import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvailabilityService } from './availability.service';
import { UserAvailability } from '../entities/user-availability.entity';
import { User } from '../../../users/user.entity';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let availabilityRepository: Repository<UserAvailability>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: getRepositoryToken(UserAvailability),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    availabilityRepository = module.get<Repository<UserAvailability>>(getRepositoryToken(UserAvailability));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setUserAvailability', () => {
    it('should create an availability record', async () => {
      const userId = 'user-id';
      const createUserAvailabilityDto = {
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'available' as const,
      };

      // Mock repository methods
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({ id: userId } as User);
      jest.spyOn(availabilityRepository, 'create').mockImplementation((dto) => dto as any);
      jest.spyOn(availabilityRepository, 'save').mockImplementation(async (dto) => dto as any);

      const result = await service.setUserAvailability(userId, createUserAvailabilityDto);

      expect(result).toEqual({
        userId,
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        status: createUserAvailabilityDto.status,
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(availabilityRepository.create).toHaveBeenCalledWith({
        userId,
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        status: createUserAvailabilityDto.status,
      });
    });
  });
});