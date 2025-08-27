import { Task } from '../../tasks/entities/task.entity';

export class ProjectResponseDto {
  id: string;
  name: string;
  description: string;
  color: string;
  isArchived: boolean;
  userId: string;
  tasks?: Task[];
  createdAt: Date;
  updatedAt: Date;
}