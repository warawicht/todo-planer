import { Test, TestingModule } from '@nestjs/testing';
import { TimeBlocksController } from './time-blocks.controller';
import { TimeBlocksService } from './time-blocks.service';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';
import { UpdateTimeBlockDto } from './dto/update-time-block.dto';
import { TimeBlockQueryDto } from './dto/time-block-query.dto';
import { CalendarViewQueryDto } from './dto/calendar-view.dto';

const mockTimeBlocksService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getCalendarView: jest.fn(),
};

describe('TimeBlocksController', () => {
  let controller: TimeBlocksController;
  let service: TimeBlocksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeBlocksController],
      providers: [
        {
          provide: TimeBlocksService,
          useValue: mockTimeBlocksService,
        },
      ],
    }).compile();

    controller = module.get<TimeBlocksController>(TimeBlocksController);
    service = module.get<TimeBlocksService>(TimeBlocksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a time block', async () => {
      const req = { user: { id: 'user-id' } };
      const createTimeBlockDto: CreateTimeBlockDto = {
        title: 'Test Time Block',
        startTime: '2023-01-01T09:00:00Z',
        endTime: '2023-01-01T10:00:00Z',
      };

      const result = { id: 'time-block-id', ...createTimeBlockDto };
      mockTimeBlocksService.create.mockResolvedValue(result);

      expect(await controller.create(req, createTimeBlockDto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(req.user.id, createTimeBlockDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of time blocks', async () => {
      const req = { user: { id: 'user-id' } };
      const query: TimeBlockQueryDto = {};
      const result = [{ id: 'time-block-id', title: 'Test Time Block' }];

      mockTimeBlocksService.findAll.mockResolvedValue(result);

      expect(await controller.findAll(req, query)).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith(req.user.id, undefined, undefined);
    });

    it('should return time blocks with date filtering', async () => {
      const req = { user: { id: 'user-id' } };
      const query: TimeBlockQueryDto = {
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2023-01-31T23:59:59Z',
      };
      const result = [{ id: 'time-block-id', title: 'Test Time Block' }];

      mockTimeBlocksService.findAll.mockResolvedValue(result);

      expect(await controller.findAll(req, query)).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith(
        req.user.id,
        new Date(query.startDate),
        new Date(query.endDate),
      );
    });
  });

  describe('findOne', () => {
    it('should return a single time block', async () => {
      const req = { user: { id: 'user-id' } };
      const id = 'time-block-id';
      const result = { id, title: 'Test Time Block' };

      mockTimeBlocksService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(req, id)).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(req.user.id, id);
    });
  });

  describe('update', () => {
    it('should update a time block', async () => {
      const req = { user: { id: 'user-id' } };
      const id = 'time-block-id';
      const updateTimeBlockDto: UpdateTimeBlockDto = {
        title: 'Updated Title',
      };
      const result = { id, ...updateTimeBlockDto };

      mockTimeBlocksService.update.mockResolvedValue(result);

      expect(await controller.update(req, id, updateTimeBlockDto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(req.user.id, id, updateTimeBlockDto);
    });
  });

  describe('remove', () => {
    it('should remove a time block', async () => {
      const req = { user: { id: 'user-id' } };
      const id = 'time-block-id';
      const result = { message: 'Time block deleted successfully' };

      mockTimeBlocksService.remove.mockResolvedValue(undefined);

      expect(await controller.remove(req, id)).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith(req.user.id, id);
    });
  });

  describe('getCalendarView', () => {
    it('should return calendar view data', async () => {
      const req = { user: { id: 'user-id' } };
      const query: CalendarViewQueryDto = {
        view: 'week',
        date: '2023-06-15T00:00:00Z',
      };
      const result = {
        view: 'week',
        referenceDate: new Date('2023-06-15T00:00:00Z'),
        startDate: new Date('2023-06-11T00:00:00Z'),
        endDate: new Date('2023-06-17T23:59:59.999Z'),
        timeBlocks: [],
      };

      mockTimeBlocksService.getCalendarView.mockResolvedValue(result);

      expect(await controller.getCalendarView(req, query)).toBe(result);
      expect(service.getCalendarView).toHaveBeenCalledWith(
        req.user.id,
        query.view,
        new Date(query.date),
      );
    });
  });
});