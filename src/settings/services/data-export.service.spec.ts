import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataExportService } from './data-export.service';
import { DataExport } from '../entities/data-export.entity';
import { DataExportDto } from '../dto/data-export.dto';
import { TasksService } from '../../tasks/tasks.service';
import { ProjectsService } from '../../projects/projects.service';
import { TimeBlocksService } from '../../time-blocks/time-blocks.service';
import { Task } from '../../tasks/entities/task.entity';
import { Project } from '../../projects/entities/project.entity';
import { TimeBlock } from '../../time-blocks/entities/time-block.entity';

describe('DataExportService', () => {
  let service: DataExportService;
  let repository: Repository<DataExport>;
  let tasksService: TasksService;
  let projectsService: ProjectsService;
  let timeBlocksService: TimeBlocksService;

  const mockDataExportRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockTasksService = {
    findAll: jest.fn(),
  };

  const mockProjectsService = {
    findAll: jest.fn(),
  };

  const mockTimeBlocksService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataExportService,
        {
          provide: getRepositoryToken(DataExport),
          useValue: mockDataExportRepository,
        },
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
        {
          provide: TimeBlocksService,
          useValue: mockTimeBlocksService,
        },
      ],
    }).compile();

    service = module.get<DataExportService>(DataExportService);
    repository = module.get<Repository<DataExport>>(
      getRepositoryToken(DataExport),
    );
    tasksService = module.get<TasksService>(TasksService);
    projectsService = module.get<ProjectsService>(ProjectsService);
    timeBlocksService = module.get<TimeBlocksService>(TimeBlocksService);
    
    // Disable async processing for tests
    service.setDisableAsyncProcessing(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDataExport', () => {
    it('should return data export if found', async () => {
      const id = 'export-id';
      const userId = 'test-user-id';
      const dataExport = {
        id,
        userId,
        format: 'json',
        dataType: 'all',
        fileName: 'export.json',
        exportedAt: new Date(),
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as DataExport;

      mockDataExportRepository.findOne.mockResolvedValue(dataExport);

      const result = await service.getDataExport(id, userId);

      expect(result).toEqual(dataExport);
      expect(mockDataExportRepository.findOne).toHaveBeenCalledWith({
        where: { id, userId },
      });
    });

    it('should throw NotFoundException if data export not found', async () => {
      const id = 'export-id';
      const userId = 'test-user-id';

      mockDataExportRepository.findOne.mockResolvedValue(null);

      await expect(service.getDataExport(id, userId)).rejects.toThrow(
        'Data export not found',
      );

      expect(mockDataExportRepository.findOne).toHaveBeenCalledWith({
        where: { id, userId },
      });
    });
  });

  describe('createDataExport', () => {
    it('should create a new data export and trigger processing', async () => {
      const userId = 'test-user-id';
      const createDto: DataExportDto = {
        format: 'csv',
        dataType: 'tasks',
      };

      const newDataExport = {
        id: 'export-id',
        userId,
        ...createDto,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as DataExport;

      const savedDataExport = { ...newDataExport };

      mockDataExportRepository.create.mockReturnValue(newDataExport);
      mockDataExportRepository.save.mockResolvedValue(savedDataExport);

      const result = await service.createDataExport(userId, createDto);

      expect(result).toEqual(savedDataExport);
      expect(mockDataExportRepository.create).toHaveBeenCalledWith({
        userId,
        ...createDto,
        status: 'pending',
      });
      expect(mockDataExportRepository.save).toHaveBeenCalledWith(newDataExport);
    });
  });

  describe('updateDataExportStatus', () => {
    it('should update data export status', async () => {
      const id = 'export-id';
      const userId = 'test-user-id';
      const fileName = 'export.csv';
      const existingDataExport = {
        id,
        userId,
        format: 'csv',
        dataType: 'tasks',
        fileName: null,
        exportedAt: null,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as DataExport;

      const updatedDataExport = {
        ...existingDataExport,
        status: 'completed',
        fileName,
        exportedAt: new Date(),
      } as DataExport;

      mockDataExportRepository.findOne.mockResolvedValue(existingDataExport);
      mockDataExportRepository.save.mockResolvedValue(updatedDataExport);

      const result = await service.updateDataExportStatus(
        id,
        userId,
        'completed',
        fileName,
      );

      expect(result.status).toEqual('completed');
      expect(result.fileName).toEqual(fileName);
      expect(result.exportedAt).toBeDefined();
      expect(mockDataExportRepository.findOne).toHaveBeenCalledWith({
        where: { id, userId },
      });
      expect(mockDataExportRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...existingDataExport,
          status: 'completed',
          fileName,
          exportedAt: expect.any(Date),
        }),
      );
    });

    it('should throw NotFoundException if data export not found when updating status', async () => {
      const id = 'export-id';
      const userId = 'test-user-id';

      mockDataExportRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateDataExportStatus(id, userId, 'completed'),
      ).rejects.toThrow('Data export not found');

      expect(mockDataExportRepository.findOne).toHaveBeenCalledWith({
        where: { id, userId },
      });
      expect(mockDataExportRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteDataExport', () => {
    it('should delete data export if found', async () => {
      const id = 'export-id';
      const userId = 'test-user-id';
      const dataExport = {
        id,
        userId,
        fileName: 'export.json',
      } as DataExport;

      mockDataExportRepository.findOne.mockResolvedValue(dataExport);
      mockDataExportRepository.remove.mockResolvedValue(undefined);

      await service.deleteDataExport(id, userId);

      expect(mockDataExportRepository.findOne).toHaveBeenCalledWith({
        where: { id, userId },
      });
      expect(mockDataExportRepository.remove).toHaveBeenCalledWith(dataExport);
    });

    it('should throw NotFoundException if data export not found when deleting', async () => {
      const id = 'export-id';
      const userId = 'test-user-id';

      mockDataExportRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteDataExport(id, userId)).rejects.toThrow(
        'Data export not found',
      );

      expect(mockDataExportRepository.findOne).toHaveBeenCalledWith({
        where: { id, userId },
      });
      expect(mockDataExportRepository.remove).not.toHaveBeenCalled();
    });
  });
});