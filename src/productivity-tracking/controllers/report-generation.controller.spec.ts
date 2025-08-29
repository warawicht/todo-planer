import { Test, TestingModule } from '@nestjs/testing';
import { ReportGenerationController } from './report-generation.controller';
import { ReportGenerationService } from '../services/report-generation.service';
import { ReportTemplate } from '../entities/report-template.entity';

describe('ReportGenerationController', () => {
  let controller: ReportGenerationController;
  let service: ReportGenerationService;

  const mockReportGenerationService = {
    createReportTemplate: jest.fn(),
    getUserReportTemplates: jest.fn(),
    generateReport: jest.fn(),
    deleteReportTemplate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportGenerationController],
      providers: [
        {
          provide: ReportGenerationService,
          useValue: mockReportGenerationService,
        },
      ],
    }).compile();

    controller = module.get<ReportGenerationController>(ReportGenerationController);
    service = module.get<ReportGenerationService>(ReportGenerationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createReportTemplate', () => {
    it('should create a new report template', async () => {
      const createReportTemplateDto = {
        userId: 'user1',
        name: 'Weekly Report',
        description: 'Weekly productivity report',
        configuration: {
          includeTimeTracking: true,
          includeTaskCompletion: true,
        },
        isActive: true,
      };

      const template: ReportTemplate = {
        id: 'template1',
        ...createReportTemplateDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: null,
      };

      mockReportGenerationService.createReportTemplate.mockResolvedValue(template);

      const result = await controller.createReportTemplate(createReportTemplateDto);
      expect(result).toEqual(template);
      expect(service.createReportTemplate).toHaveBeenCalledWith(createReportTemplateDto);
    });
  });

  describe('getUserReportTemplates', () => {
    it('should retrieve user report templates', async () => {
      const userId = 'user1';
      const templates: ReportTemplate[] = [
        {
          id: 'template1',
          userId,
          name: 'Weekly Report',
          description: 'Weekly productivity report',
          configuration: {
            includeTimeTracking: true,
            includeTaskCompletion: true,
          },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: null,
        },
      ];

      mockReportGenerationService.getUserReportTemplates.mockResolvedValue(templates);

      const result = await controller.getUserReportTemplates(userId);
      expect(result).toEqual(templates);
      expect(service.getUserReportTemplates).toHaveBeenCalledWith(userId);
    });
  });

  describe('generateReport', () => {
    it('should generate a report', async () => {
      const generateReportDto = {
        userId: 'user1',
        templateId: 'template1',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        format: 'pdf',
      };

      const report = {
        templateName: 'Weekly Report',
        generatedAt: new Date(),
        period: {
          startDate: new Date(generateReportDto.startDate),
          endDate: new Date(generateReportDto.endDate),
        },
        timeTracking: {
          totalEntries: 10,
          totalDuration: 36000,
          totalDurationHours: 10,
        },
      };

      mockReportGenerationService.generateReport.mockResolvedValue(report);

      const result = await controller.generateReport(generateReportDto);
      expect(result).toEqual(report);
      expect(service.generateReport).toHaveBeenCalledWith(
        generateReportDto.userId,
        generateReportDto.templateId,
        new Date(generateReportDto.startDate),
        new Date(generateReportDto.endDate)
      );
    });
  });

  describe('deleteReportTemplate', () => {
    it('should delete a report template', async () => {
      const templateId = 'template1';
      const userId = 'user1';

      mockReportGenerationService.deleteReportTemplate.mockResolvedValue(undefined);

      await controller.deleteReportTemplate(templateId, userId);
      expect(service.deleteReportTemplate).toHaveBeenCalledWith(templateId, userId);
    });
  });
});