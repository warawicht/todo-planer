import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskAssignmentService } from './task-assignment.service';
import { TaskAssignment } from '../entities/task-assignment.entity';
import { Task } from '../../../tasks/entities/task.entity';
import { User } from '../../../users/user.entity';

describe('TaskAssignmentService', () => {
  let service: TaskAssignmentService;
  let taskAssignmentRepository: Repository<TaskAssignment>;
  let taskRepository: Repository<Task>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskAssignmentService,
        {
          provide: getRepositoryToken(TaskAssignment),
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

    service = module.get<TaskAssignmentService>(TaskAssignmentService);
    taskAssignmentRepository = module.get<Repository<TaskAssignment>>(getRepositoryToken(TaskAssignment));
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignTask', () => {
    it('should create a task assignment', async () => {
      const taskId = 'task-id';
      const assignedById = 'assigned-by-id';
      const createTaskAssignmentDto = {
        assignedToId: 'assigned-to-id',
      };

      // Mock repository methods
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue({ id: taskId } as Task);
      jest.spyOn(userRepository, 'findOne').mockImplementation(async (options: any) => {
        if (options.where.id === assignedById) {
          return { id: assignedById } as User;
        }
        if (options.where.id === createTaskAssignmentDto.assignedToId) {
          return { id: createTaskAssignmentDto.assignedToId } as User;
        }
        return null;
      });
      jest.spyOn(taskAssignmentRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(taskAssignmentRepository, 'create').mockImplementation((dto) => dto as any);
      jest.spyOn(taskAssignmentRepository, 'save').mockImplementation(async (dto) => dto as any);

      const result = await service.assignTask(taskId, assignedById, createTaskAssignmentDto);

      expect(result).toEqual({
        taskId,
        assignedById,
        assignedToId: createTaskAssignmentDto.assignedToId,
      });
      expect(taskRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
      expect(userRepository.findOne).toHaveBeenCalledTimes(2);
      expect(taskAssignmentRepository.findOne).toHaveBeenCalledWith({
        where: { taskId, assignedToId: createTaskAssignmentDto.assignedToId }
      });
      expect(taskAssignmentRepository.create).toHaveBeenCalledWith({
        taskId,
        assignedById,
        assignedToId: createTaskAssignmentDto.assignedToId,
      });
    });
  });
});