import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';

const mockTaskRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<Task>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task with default status', async () => {
      const userId = 'user-id';
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 1,
      };

      const taskEntity = {
        id: 'task-id',
        ...createTaskDto,
        userId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.create.mockReturnValue(taskEntity);
      mockTaskRepository.save.mockResolvedValue(taskEntity);

      const result = await service.create(userId, createTaskDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        userId,
        status: 'pending',
      });
      expect(repository.save).toHaveBeenCalledWith(taskEntity);
      expect(result).toEqual(taskEntity);
    });

    it('should handle title validation (1-200 characters)', async () => {
      const userId = 'user-id';
      const createTaskDto = {
        title: '', // Empty title should be invalid
        description: 'Test Description',
      };

      // Note: Validation is handled by DTO and controller, not service
      // This test just verifies the service passes data through
      const taskEntity = {
        id: 'task-id',
        ...createTaskDto,
        userId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.create.mockReturnValue(taskEntity);
      mockTaskRepository.save.mockResolvedValue(taskEntity);

      const result = await service.create(userId, createTaskDto);

      expect(result).toEqual(taskEntity);
    });
  });

  describe('findAll', () => {
    it('should retrieve all tasks for a user with pagination', async () => {
      const userId = 'user-id';
      const tasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          userId,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-2',
          title: 'Task 2',
          userId,
          status: 'completed',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockTaskRepository.findAndCount.mockResolvedValue([tasks, tasks.length]);

      const [result, total] = await service.findAll(userId, {
        page: 1,
        limit: 10,
      });

      expect(repository.findAndCount).toHaveBeenCalled();
      expect(result).toEqual(tasks);
      expect(total).toEqual(tasks.length);
    });

    it('should filter tasks by status', async () => {
      const userId = 'user-id';
      const tasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          userId,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockTaskRepository.findAndCount.mockResolvedValue([tasks, tasks.length]);

      const [result, total] = await service.findAll(userId, {
        status: 'pending',
      });

      expect(repository.findAndCount).toHaveBeenCalled();
      expect(result).toEqual(tasks);
      expect(total).toEqual(tasks.length);
    });
  });

  describe('findOne', () => {
    it('should retrieve a specific task', async () => {
      const userId = 'user-id';
      const taskId = 'task-id';
      const task = {
        id: taskId,
        title: 'Test Task',
        userId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.findOne.mockResolvedValue(task);

      const result = await service.findOne(userId, taskId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: taskId, userId },
        relations: ['project', 'tags', 'timeBlocks'],
      });
      expect(result).toEqual(task);
    });

    it('should throw NotFoundException if task not found', async () => {
      const userId = 'user-id';
      const taskId = 'non-existent-id';

      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId, taskId)).rejects.toThrow('Task not found');
    });
  });

  describe('update', () => {
    it('should update a task with partial data', async () => {
      const userId = 'user-id';
      const taskId = 'task-id';
      const updateTaskDto = {
        title: 'Updated Task Title',
        priority: 2,
      };

      const existingTask = {
        id: taskId,
        title: 'Original Task Title',
        userId,
        status: 'pending',
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTask = {
        ...existingTask,
        ...updateTaskDto,
        updatedAt: new Date(),
      };

      mockTaskRepository.findOne.mockResolvedValue(existingTask);
      mockTaskRepository.update.mockResolvedValue(undefined);
      mockTaskRepository.findOne.mockResolvedValue(updatedTask);

      const result = await service.update(userId, taskId, updateTaskDto);

      expect(repository.update).toHaveBeenCalledWith(
        { id: taskId, userId },
        updateTaskDto,
      );
      expect(result).toEqual(updatedTask);
    });

    it('should handle status transition to completed', async () => {
      const userId = 'user-id';
      const taskId = 'task-id';
      const updateTaskDto = {
        status: 'completed',
      };

      const existingTask = {
        id: taskId,
        title: 'Test Task',
        userId,
        status: 'in-progress',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTask = {
        ...existingTask,
        ...updateTaskDto,
        completedAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      mockTaskRepository.findOne.mockResolvedValue(existingTask);
      mockTaskRepository.update.mockResolvedValue(undefined);
      mockTaskRepository.findOne.mockResolvedValue(updatedTask);

      const result = await service.update(userId, taskId, updateTaskDto);

      expect(result.status).toEqual('completed');
      expect(result.completedAt).toBeDefined();
    });

    it('should handle invalid status transition', async () => {
      const userId = 'user-id';
      const taskId = 'task-id';
      const updateTaskDto = {
        status: 'cancelled',
      };

      const existingTask = {
        id: taskId,
        title: 'Test Task',
        userId,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.findOne.mockResolvedValue(existingTask);

      await expect(service.update(userId, taskId, updateTaskDto)).rejects.toThrow(
        'Invalid status transition',
      );
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      const userId = 'user-id';
      const taskId = 'task-id';

      const existingTask = {
        id: taskId,
        title: 'Test Task',
        userId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.findOne.mockResolvedValue(existingTask);
      mockTaskRepository.delete.mockResolvedValue(undefined);

      await expect(service.remove(userId, taskId)).resolves.toBeUndefined();

      expect(repository.delete).toHaveBeenCalledWith({ id: taskId, userId });
    });

    it('should throw NotFoundException if task not found', async () => {
      const userId = 'user-id';
      const taskId = 'non-existent-id';

      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(userId, taskId)).rejects.toThrow('Task not found');
    });
  });

  describe('isValidStatusTransition', () => {
    it('should validate valid status transitions', () => {
      // Valid transitions
      expect(service['isValidStatusTransition']('pending', 'in-progress')).toBe(true);
      expect(service['isValidStatusTransition']('pending', 'cancelled')).toBe(true);
      expect(service['isValidStatusTransition']('in-progress', 'completed')).toBe(true);
      expect(service['isValidStatusTransition']('in-progress', 'cancelled')).toBe(true);
      expect(service['isValidStatusTransition']('completed', 'pending')).toBe(true);
      expect(service['isValidStatusTransition']('cancelled', 'pending')).toBe(true);
    });

    it('should reject invalid status transitions', () => {
      // Invalid transitions
      expect(service['isValidStatusTransition']('pending', 'completed')).toBe(false);
      expect(service['isValidStatusTransition']('cancelled', 'completed')).toBe(false);
      expect(service['isValidStatusTransition']('completed', 'cancelled')).toBe(false);
    });
  });

  describe('isTaskOverdue', () => {
    it('should identify overdue tasks', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      const overdueTask = {
        id: 'task-1',
        title: 'Overdue Task',
        dueDate: pastDate,
        status: 'pending',
      } as Task;

      const futureTask = {
        id: 'task-2',
        title: 'Future Task',
        dueDate: futureDate,
        status: 'pending',
      } as Task;

      const completedTask = {
        id: 'task-3',
        title: 'Completed Task',
        dueDate: pastDate,
        status: 'completed',
      } as Task;

      expect(service.isTaskOverdue(overdueTask)).toBe(true);
      expect(service.isTaskOverdue(futureTask)).toBe(false);
      expect(service.isTaskOverdue(completedTask)).toBe(false);
    });

    it('should handle tasks without due dates', () => {
      const taskWithoutDueDate = {
        id: 'task-1',
        title: 'Task without due date',
        status: 'pending',
      } as Task;

      expect(service.isTaskOverdue(taskWithoutDueDate)).toBe(false);
    });
  });

  describe('getDueSoonTasks', () => {
    it('should identify tasks due soon', () => {
      const now = new Date();
      const dueSoon = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours from now
      const notDueSoon = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now
      const overdue = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago

      const tasks = [
        {
          id: 'task-1',
          title: 'Due Soon Task',
          dueDate: dueSoon,
          status: 'pending',
        } as Task,
        {
          id: 'task-2',
          title: 'Not Due Soon Task',
          dueDate: notDueSoon,
          status: 'pending',
        } as Task,
        {
          id: 'task-3',
          title: 'Overdue Task',
          dueDate: overdue,
          status: 'pending',
        } as Task,
        {
          id: 'task-4',
          title: 'Completed Task',
          dueDate: dueSoon,
          status: 'completed',
        } as Task,
      ];

      const dueSoonTasks = service.getDueSoonTasks(tasks);

      expect(dueSoonTasks).toHaveLength(1);
      expect(dueSoonTasks[0].title).toBe('Due Soon Task');
    });
  });
});