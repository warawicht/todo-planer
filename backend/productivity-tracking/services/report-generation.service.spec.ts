import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportGenerationService } from './report-generation.service';
import { ReportTemplate } from '../entities/report-template.entity';
import { TimeEntry } from '../entities/time-entry.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Project } from '../../projects/entities/project.entity';

describe('ReportGenerationService', () => {
  let service: ReportGenerationService;
  let reportTemplateRepository: Repository<ReportTemplate>;
  let timeEntryRepository: Repository<TimeEntry>;
  let taskRepository: Repository<Task>;
  let projectRepository: Repository<Project>;

  const mockReportTemplateRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
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
      getCount: jest.fn(),
    })),
  };

  const mockProjectRepository = {
    findByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportGenerationService,
        {
          provide: getRepositoryToken(ReportTemplate),
          useValue: mockReportTemplateRepository,
        },
        {
          provide: getRepositoryToken(TimeEntry),
          useValue: mockTimeEntryRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
      ],
    }).compile();

    service = module.get<ReportGenerationService>(ReportGenerationService);
    reportTemplateRepository = module.get<Repository<ReportTemplate>>(getRepositoryToken(ReportTemplate));
    timeEntryRepository = module.get<Repository<TimeEntry>>(getRepositoryToken(TimeEntry));
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    projectRepository = module.get<Repository<Project>>(getRepositoryToken(Project));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReportTemplate', () => {
    it('should create a new report template', async () => {
      const templateData = {
        userId: 'user1',
        name: 'Weekly Report',
        configuration: {
          includeTimeTracking: true,
          includeTaskCompletion: true,
        },
        isActive: true,
      };

      mockReportTemplateRepository.create.mockReturnValue(templateData);
      mockReportTemplateRepository.save.mockResolvedValue(templateData);

      const result = await service.createReportTemplate(templateData);
      expect(result).toEqual(templateData);
      expect(reportTemplateRepository.create).toHaveBeenCalledWith(templateData);
      expect(reportTemplateRepository.save).toHaveBeenCalledWith(templateData);
    });
  });

  describe('getUserReportTemplates', () => {
    it('should retrieve user report templates', async () => {
      const userId = 'user1';
      const templates = [
        {
          id: 'template1',
          userId,
          name: 'Weekly Report',
          configuration: {},
          isActive: true,
        },
      ];

      mockReportTemplateRepository.find.mockResolvedValue(templates);

      const result = await service.getUserReportTemplates(userId);
      expect(result).toEqual(templates);
      expect(reportTemplateRepository.find).toHaveBeenCalledWith({
        where: { userId, isActive: true },
      });
    });
  });

  describe('generateReport', () => {
    it('should generate a report based on template', async () => {
      const userId = 'user1';
      const templateId = 'template1';
      const startDate = new Date();
      const endDate = new Date();
      
      const template = {
        id: templateId,
        userId,
        name: 'Weekly Report',
        configuration: {
          includeTimeTracking: true,
          includeTaskCompletion: true,
        },
        isActive: true,
      };

      mockReportTemplateRepository.findOne.mockResolvedValue(template);
      
      const timeEntries = [
        {
          id: 'entry1',
          userId,
          startTime: new Date(),
          duration: 3600,
        },
      ];
      
      const tasks = [
        {
          id: 'task1',
          userId,
          title: 'Task 1',
          completed: true,
        },
      ];

      const timeQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(timeEntries),
      };
      
      const taskQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(tasks),
      };

      mockTimeEntryRepository.createQueryBuilder.mockReturnValue(timeQueryBuilder);
      mockTaskRepository.createQueryBuilder.mockReturnValue(taskQueryBuilder);

      const result = await service.generateReport(userId, templateId, startDate, endDate);
      expect(result).toBeDefined();
      expect(result.templateName).toBe('Weekly Report');
      expect(reportTemplateRepository.findOne).toHaveBeenCalledWith({
        where: { id: templateId, userId },
      });
    });
  });

  describe('deleteReportTemplate', () => {
    it('should delete a report template', async () => {
      const templateId = 'template1';
      const userId = 'user1';
      const template = {
        id: templateId,
        userId,
        name: 'Weekly Report',
        configuration: {},
        isActive: true,
      };

      mockReportTemplateRepository.findOne.mockResolvedValue(template);
      mockReportTemplateRepository.remove.mockResolvedValue(undefined);

      await service.deleteReportTemplate(templateId, userId);
      expect(reportTemplateRepository.findOne).toHaveBeenCalledWith({
        where: { id: templateId, userId },
      });
      expect(reportTemplateRepository.remove).toHaveBeenCalledWith(template);
    });
  });
});