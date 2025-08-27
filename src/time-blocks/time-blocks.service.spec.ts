import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeBlocksService } from './time-blocks.service';
import { TimeBlock } from './entities/time-block.entity';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';
import { UpdateTimeBlockDto } from './dto/update-time-block.dto';
import { TimeBlockConflictException } from './exceptions/time-block-conflict.exception';

const mockTimeBlockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('TimeBlocksService', () => {
  let service: TimeBlocksService;
  let repository: Repository<TimeBlock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeBlocksService,
        {
          provide: getRepositoryToken(TimeBlock),
          useValue: mockTimeBlockRepository,
        },
      ],
    }).compile();

    service = module.get<TimeBlocksService>(TimeBlocksService);
    repository = module.get<Repository<TimeBlock>>(getRepositoryToken(TimeBlock));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a time block successfully', async () => {
      const userId = 'user-id';
      const createTimeBlockDto: CreateTimeBlockDto = {
        title: 'Test Time Block',
        startTime: '2023-01-01T09:00:00Z',
        endTime: '2023-01-01T10:00:00Z',
      };

      const timeBlock = new TimeBlock();
      Object.assign(timeBlock, { ...createTimeBlockDto, userId });

      mockTimeBlockRepository.find.mockResolvedValue([]);
      mockTimeBlockRepository.create.mockReturnValue(timeBlock);
      mockTimeBlockRepository.save.mockResolvedValue(timeBlock);

      const result = await service.create(userId, createTimeBlockDto);

      expect(result).toEqual(timeBlock);
      expect(repository.create).toHaveBeenCalledWith({
        ...createTimeBlockDto,
        startTime: new Date(createTimeBlockDto.startTime),
        endTime: new Date(createTimeBlockDto.endTime),
        userId,
      });
      expect(repository.save).toHaveBeenCalledWith(timeBlock);
    });

    it('should throw TimeBlockConflictException when conflicts exist', async () => {
      const userId = 'user-id';
      const createTimeBlockDto: CreateTimeBlockDto = {
        title: 'Test Time Block',
        startTime: '2023-01-01T09:00:00Z',
        endTime: '2023-01-01T10:00:00Z',
      };

      const conflictingTimeBlock = new TimeBlock();
      conflictingTimeBlock.id = 'conflict-id';
      conflictingTimeBlock.title = 'Conflicting Block';
      conflictingTimeBlock.startTime = new Date('2023-01-01T09:30:00Z');
      conflictingTimeBlock.endTime = new Date('2023-01-01T10:30:00Z');

      mockTimeBlockRepository.find.mockResolvedValue([conflictingTimeBlock]);

      await expect(service.create(userId, createTimeBlockDto)).rejects.toThrow(
        TimeBlockConflictException,
      );
    });

    it('should throw BadRequestException for invalid time range', async () => {
      const userId = 'user-id';
      const createTimeBlockDto: CreateTimeBlockDto = {
        title: 'Test Time Block',
        startTime: '2023-01-01T10:00:00Z',
        endTime: '2023-01-01T09:00:00Z', // End time before start time
      };

      await expect(service.create(userId, createTimeBlockDto)).rejects.toThrow(
        'End time must be after start time',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of time blocks', async () => {
      const userId = 'user-id';
      const timeBlocks = [
        new TimeBlock(),
        new TimeBlock(),
      ];

      mockTimeBlockRepository.find.mockResolvedValue(timeBlocks);

      const result = await service.findAll(userId);

      expect(result).toEqual(timeBlocks);
      expect(repository.find).toHaveBeenCalledWith({ where: { userId } });
    });
  });

  describe('findOne', () => {
    it('should return a time block by id', async () => {
      const userId = 'user-id';
      const id = 'time-block-id';
      const timeBlock = new TimeBlock();
      timeBlock.id = id;

      mockTimeBlockRepository.findOne.mockResolvedValue(timeBlock);

      const result = await service.findOne(userId, id);

      expect(result).toEqual(timeBlock);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id, userId } });
    });

    it('should throw NotFoundException when time block is not found', async () => {
      const userId = 'user-id';
      const id = 'non-existent-id';

      mockTimeBlockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId, id)).rejects.toThrow('Time block not found');
    });
  });

  describe('update', () => {
    it('should update a time block successfully', async () => {
      const userId = 'user-id';
      const id = 'time-block-id';
      const updateTimeBlockDto: UpdateTimeBlockDto = {
        title: 'Updated Title',
      };

      const existingTimeBlock = new TimeBlock();
      existingTimeBlock.id = id;
      existingTimeBlock.title = 'Original Title';
      existingTimeBlock.startTime = new Date('2023-01-01T09:00:00Z');
      existingTimeBlock.endTime = new Date('2023-01-01T10:00:00Z');

      const updatedTimeBlock = new TimeBlock();
      Object.assign(updatedTimeBlock, { ...existingTimeBlock, ...updateTimeBlockDto });

      mockTimeBlockRepository.findOne.mockResolvedValue(existingTimeBlock);
      mockTimeBlockRepository.find.mockResolvedValue([]);
      mockTimeBlockRepository.update.mockResolvedValue(undefined);
      mockTimeBlockRepository.findOne.mockResolvedValue(updatedTimeBlock);

      const result = await service.update(userId, id, updateTimeBlockDto);

      expect(result).toEqual(updatedTimeBlock);
    });

    it('should throw TimeBlockConflictException when update causes conflicts', async () => {
      const userId = 'user-id';
      const id = 'time-block-id';
      const updateTimeBlockDto: UpdateTimeBlockDto = {
        startTime: '2023-01-01T11:00:00Z',
        endTime: '2023-01-01T12:00:00Z',
      };

      const existingTimeBlock = new TimeBlock();
      existingTimeBlock.id = id;
      existingTimeBlock.title = 'Original Title';
      existingTimeBlock.startTime = new Date('2023-01-01T09:00:00Z');
      existingTimeBlock.endTime = new Date('2023-01-01T10:00:00Z');

      const conflictingTimeBlock = new TimeBlock();
      conflictingTimeBlock.id = 'conflict-id';
      conflictingTimeBlock.title = 'Conflicting Block';
      conflictingTimeBlock.startTime = new Date('2023-01-01T11:30:00Z');
      conflictingTimeBlock.endTime = new Date('2023-01-01T12:30:00Z');

      mockTimeBlockRepository.findOne.mockResolvedValue(existingTimeBlock);
      mockTimeBlockRepository.find.mockResolvedValue([conflictingTimeBlock]);

      await expect(service.update(userId, id, updateTimeBlockDto)).rejects.toThrow(
        TimeBlockConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a time block successfully', async () => {
      const userId = 'user-id';
      const id = 'time-block-id';

      const existingTimeBlock = new TimeBlock();
      existingTimeBlock.id = id;

      mockTimeBlockRepository.findOne.mockResolvedValue(existingTimeBlock);
      mockTimeBlockRepository.delete.mockResolvedValue(undefined);

      await service.remove(userId, id);

      expect(repository.delete).toHaveBeenCalledWith({ id, userId });
    });

    it('should throw NotFoundException when trying to remove non-existent time block', async () => {
      const userId = 'user-id';
      const id = 'non-existent-id';

      mockTimeBlockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(userId, id)).rejects.toThrow('Time block not found');
    });
  });
});