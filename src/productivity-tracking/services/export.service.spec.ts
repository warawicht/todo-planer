import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportService } from './export.service';
import { AnalyticsExport } from '../entities/analytics-export.entity';
import { TimeEntry } from '../entities/time-entry.entity';
import { Task } from '../../tasks/entities/task.entity';

describe('ExportService', () => {
  let service: ExportService;
  let exportRepository: Repository<AnalyticsExport>;
  let timeEntryRepository: Repository<TimeEntry>;
  let taskRepository: Repository<Task>;

  const mockExportRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockTimeEntryRepository = {
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockTaskRepository = {
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        {
          provide: getRepositoryToken(AnalyticsExport),
          useValue: mockExportRepository,
        },
        {
          provide: getRepositoryToken(TimeEntry),
          useValue: mockTimeEntryRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<ExportService>(ExportService);
    exportRepository = module.get<Repository<AnalyticsExport>>(getRepositoryToken(AnalyticsExport));
    timeEntryRepository = module.get<Repository<TimeEntry>>(getRepositoryToken(TimeEntry));
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createExportRequest', () => {
    it('should create a new export request', async () => {
      const exportData = {
        userId: 'user1',
        format: 'csv',
        dataType: 'time_entries',
        startDate: new Date(),
        endDate: new Date(),
        status: 'pending',
      };

      mockExportRepository.create.mockReturnValue(exportData);
      mockExportRepository.save.mockResolvedValue(exportData);

      const result = await service.createExportRequest(exportData);
      expect(result).toEqual(exportData);
      expect(exportRepository.create).toHaveBeenCalledWith({
        ...exportData,
        status: 'pending',
      });
      expect(exportRepository.save).toHaveBeenCalledWith(exportData);
    });
  });

  describe('getUserExports', () => {
    it('should retrieve user export requests', async () => {
      const userId = 'user1';
      const exports = [
        {
          id: 'export1',
          userId,
          format: 'csv',
          dataType: 'time_entries',
          startDate: new Date(),
          endDate: new Date(),
          status: 'completed',
        },
      ];

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(exports),
      };

      mockExportRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getUserExports(userId);
      expect(result).toEqual(exports);
      expect(exportRepository.createQueryBuilder).toHaveBeenCalledWith('export');
    });
  });

  describe('processExport', () => {
    it('should process an export request', async () => {
      const exportId = 'export1';
      const userId = 'user1';
      const exportRequest = {
        id: exportId,
        userId,
        format: 'csv',
        dataType: 'time_entries',
        startDate: new Date(),
        endDate: new Date(),
        status: 'pending',
      };

      mockExportRepository.findOne.mockResolvedValue(exportRequest);
      mockExportRepository.save.mockResolvedValue({
        ...exportRequest,
        status: 'completed',
        fileName: `export_${exportId}.csv`,
        completedAt: new Date(),
      });

      const result = await service.processExport(exportId, userId);
      expect(result.status).toBe('completed');
      expect(exportRepository.findOne).toHaveBeenCalledWith({
        where: { id: exportId, userId },
      });
    });

    it('should handle export processing errors', async () => {
      const exportId = 'export1';
      const userId = 'user1';
      const exportRequest = {
        id: exportId,
        userId,
        format: 'invalid_format',
        dataType: 'time_entries',
        startDate: new Date(),
        endDate: new Date(),
        status: 'pending',
      };

      mockExportRepository.findOne.mockResolvedValue(exportRequest);
      mockExportRepository.save.mockImplementation(async (exportObj) => {
        if (exportObj.status === 'processing') {
          throw new Error('Invalid format');
        }
        return exportObj;
      });

      await expect(service.processExport(exportId, userId)).rejects.toThrow();
      expect(exportRepository.findOne).toHaveBeenCalledWith({
        where: { id: exportId, userId },
      });
    });
  });

  describe('getExportById', () => {
    it('should retrieve an export by ID', async () => {
      const exportId = 'export1';
      const userId = 'user1';
      const exportRequest = {
        id: exportId,
        userId,
        format: 'csv',
        dataType: 'time_entries',
        startDate: new Date(),
        endDate: new Date(),
        status: 'completed',
      };

      mockExportRepository.findOne.mockResolvedValue(exportRequest);

      const result = await service.getExportById(exportId, userId);
      expect(result).toEqual(exportRequest);
      expect(exportRepository.findOne).toHaveBeenCalledWith({
        where: { id: exportId, userId },
      });
    });
  });

  describe('cancelExport', () => {
    it('should cancel an export request', async () => {
      const exportId = 'export1';
      const userId = 'user1';
      const exportRequest = {
        id: exportId,
        userId,
        format: 'csv',
        dataType: 'time_entries',
        startDate: new Date(),
        endDate: new Date(),
        status: 'pending',
      };

      mockExportRepository.findOne.mockResolvedValue(exportRequest);
      mockExportRepository.save.mockResolvedValue({
        ...exportRequest,
        status: 'cancelled',
      });

      await service.cancelExport(exportId, userId);
      expect(exportRepository.findOne).toHaveBeenCalledWith({
        where: { id: exportId, userId },
      });
      expect(exportRepository.save).toHaveBeenCalledWith({
        ...exportRequest,
        status: 'cancelled',
      });
    });

    it('should not cancel a completed export', async () => {
      const exportId = 'export1';
      const userId = 'user1';
      const exportRequest = {
        id: exportId,
        userId,
        format: 'csv',
        dataType: 'time_entries',
        startDate: new Date(),
        endDate: new Date(),
        status: 'completed',
      };

      mockExportRepository.findOne.mockResolvedValue(exportRequest);

      await expect(service.cancelExport(exportId, userId)).rejects.toThrow('Cannot cancel a completed export');
      expect(exportRepository.findOne).toHaveBeenCalledWith({
        where: { id: exportId, userId },
      });
    });
  });
});