import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskAttachmentsService } from './task-attachments.service';
import { TaskAttachment } from '../entities/attachments/task-attachment.entity';
import { TasksService } from '../tasks.service';

const mockTaskAttachmentRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};

const mockTasksService = {
  findOne: jest.fn(),
};

describe('TaskAttachmentsService', () => {
  let service: TaskAttachmentsService;
  let repository: Repository<TaskAttachment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskAttachmentsService,
        {
          provide: getRepositoryToken(TaskAttachment),
          useValue: mockTaskAttachmentRepository,
        },
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    service = module.get<TaskAttachmentsService>(TaskAttachmentsService);
    repository = module.get<Repository<TaskAttachment>>(getRepositoryToken(TaskAttachment));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload a file and create an attachment record', async () => {
      const userId = 'user-id';
      const taskId = 'task-id';
      const file = {
        buffer: Buffer.from('test content'),
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: 12,
      } as Express.Multer.File;

      const attachmentEntity = {
        id: 'attachment-id',
        fileName: 'uuid-filename.txt',
        originalName: 'test.txt',
        mimeType: 'text/plain',
        fileSize: 12,
        storagePath: './uploads/uuid-filename.txt',
        taskId,
        userId,
        uploadedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTasksService.findOne.mockResolvedValue({});
      mockTaskAttachmentRepository.create.mockReturnValue(attachmentEntity);
      mockTaskAttachmentRepository.save.mockResolvedValue(attachmentEntity);

      const result = await service.uploadFile(userId, taskId, file);

      expect(mockTasksService.findOne).toHaveBeenCalledWith(userId, taskId);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(attachmentEntity);
      expect(result).toEqual(attachmentEntity);
    });

    it('should reject files that exceed size limit', async () => {
      const userId = 'user-id';
      const taskId = 'task-id';
      const file = {
        buffer: Buffer.from('test content'),
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: 15 * 1024 * 1024, // 15MB - exceeds 10MB limit
      } as Express.Multer.File;

      mockTasksService.findOne.mockResolvedValue({});

      await expect(service.uploadFile(userId, taskId, file)).rejects.toThrow(
        'File size exceeds 10MB limit',
      );
    });

    it('should reject files with unsupported MIME types', async () => {
      const userId = 'user-id';
      const taskId = 'task-id';
      const file = {
        buffer: Buffer.from('test content'),
        originalname: 'test.exe',
        mimetype: 'application/x-msdownload',
        size: 12,
      } as Express.Multer.File;

      mockTasksService.findOne.mockResolvedValue({});

      await expect(service.uploadFile(userId, taskId, file)).rejects.toThrow(
        'File type not allowed',
      );
    });
  });

  describe('findAll', () => {
    it('should retrieve all attachments for a task', async () => {
      const userId = 'user-id';
      const taskId = 'task-id';
      const attachments = [
        {
          id: 'attachment-1',
          fileName: 'file1.txt',
          originalName: 'test1.txt',
          mimeType: 'text/plain',
          fileSize: 12,
          storagePath: './uploads/file1.txt',
          taskId,
          userId,
          uploadedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'attachment-2',
          fileName: 'file2.txt',
          originalName: 'test2.txt',
          mimeType: 'text/plain',
          fileSize: 15,
          storagePath: './uploads/file2.txt',
          taskId,
          userId,
          uploadedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockTasksService.findOne.mockResolvedValue({});
      mockTaskAttachmentRepository.find.mockResolvedValue(attachments);

      const result = await service.findAll(userId, taskId);

      expect(mockTasksService.findOne).toHaveBeenCalledWith(userId, taskId);
      expect(repository.find).toHaveBeenCalledWith({
        where: { taskId, userId },
        order: {
          uploadedAt: 'DESC',
        },
      });
      expect(result).toEqual(attachments);
    });
  });

  describe('findOne', () => {
    it('should retrieve a specific attachment', async () => {
      const userId = 'user-id';
      const taskId = 'task-id';
      const attachmentId = 'attachment-id';
      const attachment = {
        id: attachmentId,
        fileName: 'file.txt',
        originalName: 'test.txt',
        mimeType: 'text/plain',
        fileSize: 12,
        storagePath: './uploads/file.txt',
        taskId,
        userId,
        uploadedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTasksService.findOne.mockResolvedValue({});
      mockTaskAttachmentRepository.findOne.mockResolvedValue(attachment);

      const result = await service.findOne(userId, taskId, attachmentId);

      expect(mockTasksService.findOne).toHaveBeenCalledWith(userId, taskId);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: attachmentId, taskId, userId },
      });
      expect(result).toEqual(attachment);
    });

    it('should throw NotFoundException if attachment not found', async () => {
      const userId = 'user-id';
      const taskId = 'task-id';
      const attachmentId = 'non-existent-id';

      mockTasksService.findOne.mockResolvedValue({});
      mockTaskAttachmentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId, taskId, attachmentId)).rejects.toThrow(
        'Attachment not found',
      );
    });
  });

  describe('remove', () => {
    it('should delete an attachment and its file', async () => {
      const userId = 'user-id';
      const taskId = 'task-id';
      const attachmentId = 'attachment-id';
      const attachment = {
        id: attachmentId,
        fileName: 'file.txt',
        originalName: 'test.txt',
        mimeType: 'text/plain',
        fileSize: 12,
        storagePath: './uploads/file.txt',
        taskId,
        userId,
        uploadedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTasksService.findOne.mockResolvedValue({});
      mockTaskAttachmentRepository.findOne.mockResolvedValue(attachment);
      mockTaskAttachmentRepository.delete.mockResolvedValue(undefined);

      await expect(service.remove(userId, taskId, attachmentId)).resolves.toBeUndefined();

      expect(mockTasksService.findOne).toHaveBeenCalledWith(userId, taskId);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: attachmentId, taskId, userId },
      });
      expect(repository.delete).toHaveBeenCalledWith({ id: attachmentId, taskId, userId });
    });

    it('should throw NotFoundException if attachment not found', async () => {
      const userId = 'user-id';
      const taskId = 'task-id';
      const attachmentId = 'non-existent-id';

      mockTasksService.findOne.mockResolvedValue({});
      mockTaskAttachmentRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(userId, taskId, attachmentId)).rejects.toThrow(
        'Attachment not found',
      );
    });
  });
});