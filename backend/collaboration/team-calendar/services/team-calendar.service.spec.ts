import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamCalendarService } from './team-calendar.service';
import { User } from '../../../users/user.entity';
import { TimeBlock } from '../../../time-blocks/entities/time-block.entity';
import { UserAvailability } from '../../availability/entities/user-availability.entity';

describe('TeamCalendarService', () => {
  let service: TeamCalendarService;
  let userRepository: Repository<User>;
  let timeBlockRepository: Repository<TimeBlock>;
  let availabilityRepository: Repository<UserAvailability>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamCalendarService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(TimeBlock),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserAvailability),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TeamCalendarService>(TeamCalendarService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    timeBlockRepository = module.get<Repository<TimeBlock>>(getRepositoryToken(TimeBlock));
    availabilityRepository = module.get<Repository<UserAvailability>>(getRepositoryToken(UserAvailability));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTeamCalendarData', () => {
    it('should return calendar data for a team', async () => {
      const userIds = ['user1', 'user2'];
      const users = [{ id: 'user1' }, { id: 'user2' }] as User[];
      
      // Mock repository methods
      jest.spyOn(userRepository, 'find').mockResolvedValue(users);
      jest.spyOn(timeBlockRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any);
      
      jest.spyOn(availabilityRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any);

      const result = await service.getTeamCalendarData(userIds);

      expect(result).toEqual({
        timeBlocks: [],
        availability: [],
      });
      expect(userRepository.find).toHaveBeenCalledWith({
        where: {
          id: expect.arrayContaining(userIds)
        }
      });
    });
  });

  describe('getUserCalendarData', () => {
    it('should return calendar data for a user', async () => {
      const userId = 'user1';
      const user = { id: userId } as User;
      
      // Mock repository methods
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(timeBlockRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any);
      
      jest.spyOn(availabilityRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any);

      const result = await service.getUserCalendarData(userId);

      expect(result).toEqual({
        user,
        timeBlocks: [],
        availability: [],
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });
  });
});