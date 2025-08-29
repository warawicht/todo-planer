import { Test, TestingModule } from '@nestjs/testing';
import { ExportController } from './export.controller';
import { ExportService } from '../services/export.service';
import { AnalyticsExport } from '../entities/analytics-export.entity';

describe('ExportController', () => {
  let controller: ExportController;
  let service: ExportService;

  const mockExportService = {
    createExportRequest: jest.fn(),
    processExport: jest.fn(),
    getUserExports: jest.fn(),
    getExportById: jest.fn(),
    cancelExport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExportController],
      providers: [
        {
          provide: ExportService,
          useValue: mockExportService,
        },
      ],
    }).compile();

    controller = module.get<ExportController>(ExportController);
    service = module.get<ExportService>(ExportService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('exportData', () => {
    it('should create and process an export request', async () => {
      const exportDataDto = {
        userId: 'user1',
        format: 'csv',
        dataType: 'time_entries',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        filters: {},
      };

      const exportRequest: AnalyticsExport = {
        id: 'export1',
        ...exportDataDto,
        status: 'completed',
        fileName: 'export_export1.csv',
        completedAt: new Date(),
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: null,
      };

      mockExportService.createExportRequest.mockResolvedValue(exportRequest);
      mockExportService.processExport.mockResolvedValue(exportRequest);

      const result = await controller.exportData(exportDataDto);
      expect(result).toEqual(exportRequest);
      expect(service.createExportRequest).toHaveBeenCalledWith(exportDataDto);
      expect(service.processExport).toHaveBeenCalledWith('export1', exportDataDto.userId);
    });
  });

  describe('getUserExports', () => {
    it('should retrieve user export requests', async () => {
      const userId = 'user1';
      const status = 'completed';
      const exports: AnalyticsExport[] = [
        {
          id: 'export1',
          userId,
          format: 'csv',
          dataType: 'time_entries',
          startDate: new Date(),
          endDate: new Date(),
          status: 'completed',
          fileName: 'export_export1.csv',
          filters: {},
          completedAt: new Date(),
          errorMessage: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: null,
        },
      ];

      mockExportService.getUserExports.mockResolvedValue(exports);

      const result = await controller.getUserExports(userId, status);
      expect(result).toEqual(exports);
      expect(service.getUserExports).toHaveBeenCalledWith(userId, status);
    });
  });

  describe('getExportById', () => {
    it('should retrieve an export by ID', async () => {
      const exportId = 'export1';
      const userId = 'user1';
      const exportRequest: AnalyticsExport = {
        id: exportId,
        userId,
        format: 'csv',
        dataType: 'time_entries',
        startDate: new Date(),
        endDate: new Date(),
        status: 'completed',
        fileName: 'export_export1.csv',
        filters: {},
        completedAt: new Date(),
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: null,
      };

      mockExportService.getExportById.mockResolvedValue(exportRequest);

      const result = await controller.getExportById(exportId, userId);
      expect(result).toEqual(exportRequest);
      expect(service.getExportById).toHaveBeenCalledWith(exportId, userId);
    });
  });

  describe('cancelExport', () => {
    it('should cancel an export request', async () => {
      const exportId = 'export1';
      const userId = 'user1';

      mockExportService.cancelExport.mockResolvedValue(undefined);

      await controller.cancelExport(exportId, userId);
      expect(service.cancelExport).toHaveBeenCalledWith(exportId, userId);
    });
  });
});