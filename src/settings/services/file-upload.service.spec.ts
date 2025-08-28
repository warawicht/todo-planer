import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadService } from './file-upload.service';
import * as fs from 'fs';
import * as path from 'path';

// Mock the fs module
jest.mock('fs');

describe('FileUploadService', () => {
  let service: FileUploadService;

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileUploadService],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveAvatar', () => {
    it('should save avatar file and return URL', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test content'),
      } as Express.Multer.File;
      
      const userId = 'test-user-id';
      
      // Mock fs functions
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockImplementation(() => undefined);
      (fs.writeFileSync as jest.Mock).mockImplementation(() => undefined);
      
      const result = await service.saveAvatar(mockFile, userId);
      
      expect(result).toContain('/uploads/avatars/');
      expect(fs.existsSync).toHaveBeenCalledWith(path.join(process.cwd(), 'uploads', 'avatars'));
      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar file if it exists', async () => {
      const avatarUrl = '/uploads/avatars/test-file.jpg';
      
      // Mock fs functions
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => undefined);
      
      await service.deleteAvatar(avatarUrl);
      
      expect(fs.existsSync).toHaveBeenCalledWith(path.join(process.cwd(), 'uploads', 'avatars', 'test-file.jpg'));
      expect(fs.unlinkSync).toHaveBeenCalledWith(path.join(process.cwd(), 'uploads', 'avatars', 'test-file.jpg'));
    });

    it('should not delete file if avatar URL is null', async () => {
      await service.deleteAvatar(null);
      // Should not throw an error
      expect(true).toBe(true);
    });
  });

  describe('avatarUploadOptions', () => {
    it('should have correct file size limit', () => {
      expect(FileUploadService.avatarUploadOptions.limits.fileSize).toBe(5 * 1024 * 1024);
    });

    it('should accept image files', () => {
      const mockFile = {
        mimetype: 'image/jpeg',
      } as Express.Multer.File;
      
      const cb = jest.fn();
      FileUploadService.avatarUploadOptions.fileFilter(null, mockFile, cb);
      
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should reject non-image files', () => {
      const mockFile = {
        mimetype: 'text/plain',
      } as Express.Multer.File;
      
      const cb = jest.fn();
      FileUploadService.avatarUploadOptions.fileFilter(null, mockFile, cb);
      
      expect(cb).toHaveBeenCalledWith(new Error('Only image files are allowed!'), false);
    });
  });
});