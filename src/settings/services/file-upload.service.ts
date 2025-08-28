import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  /**
   * Save uploaded file and return the file URL
   * @param file The uploaded file
   * @param userId The user ID
   * @returns The URL of the saved file
   */
  async saveAvatar(file: Express.Multer.File, userId: string): Promise<string> {
    // Ensure avatars directory exists
    const avatarsDir = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(avatarsDir)) {
      fs.mkdirSync(avatarsDir, { recursive: true });
    }

    // Generate unique filename
    const fileExt = extname(file.originalname);
    const fileName = `${userId}-${Date.now()}${fileExt}`;
    const filePath = path.join(avatarsDir, fileName);

    // Move file to destination
    fs.writeFileSync(filePath, file.buffer);

    // Return the URL (in a real app, this would be a proper URL)
    return `/uploads/avatars/${fileName}`;
  }

  /**
   * Delete avatar file
   * @param avatarUrl The URL of the avatar to delete
   */
  async deleteAvatar(avatarUrl: string): Promise<void> {
    if (!avatarUrl) return;

    // Extract filename from URL
    const fileName = avatarUrl.split('/').pop();
    if (!fileName) return;

    const filePath = path.join(process.cwd(), 'uploads', 'avatars', fileName);
    
    // Delete file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Multer configuration for avatar uploads
   */
  static avatarUploadOptions = {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${req.user.id}-${uniqueSuffix}${ext}`);
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept only image files
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    },
  };
}