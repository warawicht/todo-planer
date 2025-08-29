import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskSharingService } from './task-sharing.service';
import { TaskShare } from '../entities/task-share.entity';
import { Task } from '../../../tasks/entities/task.entity';
import { User } from '../../../users/user.entity';

describe('TaskSharingService', () => {
  let service: TaskSharingService;
  let taskShareRepository: Repository<TaskShare>;
  let taskRepository: Repository<Task>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskSharingService,
        {
          provide: getRepositoryToken(TaskShare),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Task),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TaskSharingService>(TaskSharingService);
    taskShareRepository = module.get<Repository<TaskShare>>(getRepositoryToken(TaskShare));
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('shareTask', () => {
    it('should create a task share', async () => {
      const taskId = 'task-id';
      const ownerId = 'owner-id';
      const createTaskShareDto = {
        sharedWithId: 'shared-with-id',
        permissionLevel: 'view' as const,
      };

      // Mock repository methods
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue({ id: taskId } as Task);
      jest.spyOn(userRepository, 'findOne').mockImplementation(async (options: any) => {
        if (options.where.id === ownerId) {
          return { id: ownerId } as User;
        }
        if (options.where.id === createTaskShareDto.sharedWithId) {
          return { id: createTaskShareDto.sharedWithId } as User;
        }
        return null;
      });
      jest.spyOn(taskShareRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(taskShareRepository, 'create').mockImplementation((dto) => dto as any);
      jest.spyOn(taskShareRepository, 'save').mockImplementation(async (dto) => dto as any);

      const result = await service.shareTask(taskId, ownerId, createTaskShareDto);

      expect(result).toEqual({
        taskId,
        ownerId,
        sharedWithId: createTaskShareDto.sharedWithId,
        permissionLevel: createTaskShareDto.permissionLevel,
      });
      expect(taskRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
      expect(userRepository.findOne).toHaveBeenCalledTimes(2);
      expect(taskShareRepository.findOne).toHaveBeenCalledWith({
        where: { taskId, sharedWithId: createTaskShareDto.sharedWithId }
      });
      expect(taskShareRepository.create).toHaveBeenCalledWith({
        taskId,
        ownerId,
        sharedWithId: createTaskShareDto.sharedWithId,
        permissionLevel: createTaskShareDto.permissionLevel,
      });
    });
  });
});