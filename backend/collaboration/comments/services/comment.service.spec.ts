import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentService } from './comment.service';
import { TaskComment } from '../entities/task-comment.entity';
import { Task } from '../../../tasks/entities/task.entity';
import { User } from '../../../users/user.entity';

describe('CommentService', () => {
  let service: CommentService;
  let commentRepository: Repository<TaskComment>;
  let taskRepository: Repository<Task>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(TaskComment),
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

    service = module.get<CommentService>(CommentService);
    commentRepository = module.get<Repository<TaskComment>>(getRepositoryToken(TaskComment));
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addComment', () => {
    it('should create a comment', async () => {
      const taskId = 'task-id';
      const userId = 'user-id';
      const createTaskCommentDto = {
        content: 'Test comment',
      };

      // Mock repository methods
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue({ id: taskId } as Task);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({ id: userId } as User);
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(commentRepository, 'create').mockImplementation((dto) => dto as any);
      jest.spyOn(commentRepository, 'save').mockImplementation(async (dto) => dto as any);

      const result = await service.addComment(taskId, userId, createTaskCommentDto);

      expect(result).toEqual({
        taskId,
        userId,
        content: createTaskCommentDto.content,
      });
      expect(taskRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId } });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(commentRepository.create).toHaveBeenCalledWith({
        taskId,
        userId,
        content: createTaskCommentDto.content,
      });
    });
  });
});