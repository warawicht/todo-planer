import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeTrackingService } from './time-tracking.service';
import { TimeEntry } from '../entities/time-entry.entity';
import { Task } from '../../tasks/entities/task.entity';

describe('TimeTrackingService', () => {
  let service: TimeTrackingService;
  let timeEntryRepository: Repository<TimeEntry>;
  let taskRepository: Repository<Task>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeTrackingService,
        {
          provide: getRepositoryToken(TimeEntry),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Task),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TimeTrackingService>(TimeTrackingService);
    timeEntryRepository = module.get<Repository<TimeEntry>>(
      getRepositoryToken(TimeEntry),
    );
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTimeEntry', () => {
    it('should create a time entry', async () => {
      const timeEntryDto = {
        userId: 'test-user-id',
        startTime: new Date(),
        isManual: true,
      };

      // Mock repository methods
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(timeEntryRepository, 'create').mockImplementation(dto => dto as any);
      jest.spyOn(timeEntryRepository, 'save').mockImplementation(dto => Promise.resolve(dto as any));

      const result = await service.createTimeEntry(timeEntryDto);

      expect(result).toBeDefined();
      expect(result.userId).toBe(timeEntryDto.userId);
      expect(result.isManual).toBe(true);
    });
  });
});