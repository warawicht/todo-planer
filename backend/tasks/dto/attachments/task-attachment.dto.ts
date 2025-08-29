export class TaskAttachmentDto {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  userId: string;
}