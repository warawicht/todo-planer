import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

const mockProjectRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
  })),
};

const mockTaskRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectRepository: Repository<Project>;
  let taskRepository: Repository<Task>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectRepository = module.get<Repository<Project>>(getRepositoryToken(Project));
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const userId = 'user-id';
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
        description: 'Test Description',
        color: '#FF0000',
      };

      const project = new Project();
      Object.assign(project, { ...createProjectDto, userId, id: 'project-id' });

      mockProjectRepository.findOne.mockResolvedValue(null);
      mockProjectRepository.create.mockReturnValue(project);
      mockProjectRepository.save.mockResolvedValue(project);

      const result = await service.create(userId, createProjectDto);

      expect(result).toEqual(project);
      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({
        where: { name: createProjectDto.name, userId }
      });
      expect(mockProjectRepository.create).toHaveBeenCalledWith({
        ...createProjectDto,
        userId,
        isArchived: false,
      });
      expect(mockProjectRepository.save).toHaveBeenCalledWith(project);
    });

    it('should throw BadRequestException if project with same name exists', async () => {
      const userId = 'user-id';
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
        description: 'Test Description',
      };

      const existingProject = new Project();
      existingProject.name = createProjectDto.name;

      mockProjectRepository.findOne.mockResolvedValue(existingProject);

      await expect(service.create(userId, createProjectDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllWithPagination', () => {
    it('should return projects with pagination', async () => {
      const userId = 'user-id';
      const page = 1;
      const limit = 10;
      
      const projects = [new Project()];
      const total = 1;
      
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([projects, total]),
      };
      
      mockProjectRepository.createQueryBuilder.mockReturnValue(queryBuilder);
      
      const result = await service.findAllWithPagination(userId, page, limit);
      
      expect(result).toEqual({ projects, total });
      expect(queryBuilder.where).toHaveBeenCalledWith('project.userId = :userId', { userId });
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(limit);
    });

    it('should filter by isArchived when provided', async () => {
      const userId = 'user-id';
      const page = 1;
      const limit = 10;
      const isArchived = true;
      
      const projects = [new Project()];
      const total = 1;
      
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([projects, total]),
      };
      
      mockProjectRepository.createQueryBuilder.mockReturnValue(queryBuilder);
      
      const result = await service.findAllWithPagination(userId, page, limit, isArchived);
      
      expect(result).toEqual({ projects, total });
      expect(queryBuilder.where).toHaveBeenCalledWith('project.userId = :userId', { userId });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('project.isArchived = :isArchived', { isArchived });
    });
  });

  describe('findOne', () => {
    it('should return a project by id', async () => {
      const userId = 'user-id';
      const projectId = 'project-id';
      
      const project = new Project();
      project.id = projectId;
      project.userId = userId;
      
      mockProjectRepository.findOne.mockResolvedValue(project);
      
      const result = await service.findOne(projectId, userId);
      
      expect(result).toEqual(project);
      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({
        where: { id: projectId, userId },
        relations: ['tasks']
      });
    });

    it('should throw NotFoundException if project not found', async () => {
      const userId = 'user-id';
      const projectId = 'project-id';
      
      mockProjectRepository.findOne.mockResolvedValue(null);
      
      await expect(service.findOne(projectId, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const userId = 'user-id';
      const projectId = 'project-id';
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Project',
        description: 'Updated Description',
      };

      const existingProject = new Project();
      existingProject.id = projectId;
      existingProject.userId = userId;
      existingProject.name = 'Old Project';

      const updatedProject = new Project();
      Object.assign(updatedProject, existingProject, updateProjectDto);

      mockProjectRepository.findOne.mockResolvedValue(existingProject);
      mockProjectRepository.update.mockResolvedValue(undefined);
      mockProjectRepository.findOne.mockResolvedValue(updatedProject);

      const result = await service.update(projectId, userId, updateProjectDto);

      expect(result).toEqual(updatedProject);
      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({ where: { id: projectId, userId } });
      expect(mockProjectRepository.update).toHaveBeenCalledWith(projectId, updateProjectDto);
    });

    it('should throw ForbiddenException if project does not belong to user', async () => {
      const userId = 'user-id';
      const projectId = 'project-id';
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Project',
      };

      mockProjectRepository.findOne.mockResolvedValue(null);

      await expect(service.update(projectId, userId, updateProjectDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if updating to existing project name', async () => {
      const userId = 'user-id';
      const projectId = 'project-id';
      const updateProjectDto: UpdateProjectDto = {
        name: 'Existing Project',
      };

      const existingProject = new Project();
      existingProject.id = projectId;
      existingProject.userId = userId;
      existingProject.name = 'Old Project';

      const conflictingProject = new Project();
      conflictingProject.name = updateProjectDto.name;

      mockProjectRepository.findOne
        .mockResolvedValueOnce(existingProject)  // First call for ownership check
        .mockResolvedValueOnce(conflictingProject);  // Second call for name uniqueness check

      await expect(service.update(projectId, userId, updateProjectDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a project', async () => {
      const userId = 'user-id';
      const projectId = 'project-id';

      const existingProject = new Project();
      existingProject.id = projectId;
      existingProject.userId = userId;

      mockProjectRepository.findOne.mockResolvedValue(existingProject);
      mockProjectRepository.delete.mockResolvedValue(undefined);

      await service.remove(projectId, userId);

      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({ where: { id: projectId, userId } });
      expect(mockProjectRepository.delete).toHaveBeenCalledWith(projectId);
    });

    it('should throw ForbiddenException if project does not belong to user', async () => {
      const userId = 'user-id';
      const projectId = 'project-id';

      mockProjectRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(projectId, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('assignTaskToProject', () => {
    it('should assign a task to a project', async () => {
      const userId = 'user-id';
      const projectId = 'project-id';
      const taskId = 'task-id';

      const project = new Project();
      project.id = projectId;
      project.userId = userId;

      const task = new Task();
      task.id = taskId;
      task.userId = userId;

      const updatedTask = new Task();
      Object.assign(updatedTask, task, { projectId });

      mockProjectRepository.findOne.mockResolvedValue(project);
      mockTaskRepository.findOne.mockResolvedValue(task);
      mockTaskRepository.save.mockResolvedValue(updatedTask);

      const result = await service.assignTaskToProject(projectId, taskId, userId);

      expect(result).toEqual(updatedTask);
      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({ where: { id: projectId, userId } });
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({ where: { id: taskId, userId } });
      expect(mockTaskRepository.save).toHaveBeenCalledWith(updatedTask);
    });

    it('should throw ForbiddenException if project does not belong to user', async () => {
      const userId = 'user-id';
      const projectId = 'project-id';
      const taskId = 'task-id';

      mockProjectRepository.findOne.mockResolvedValue(null);

      await expect(service.assignTaskToProject(projectId, taskId, userId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if task does not belong to user', async () => {
      const userId = 'user-id';
      const projectId = 'project-id';
      const taskId = 'task-id';

      const project = new Project();
      project.id = projectId;
      project.userId = userId;

      mockProjectRepository.findOne.mockResolvedValue(project);
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.assignTaskToProject(projectId, taskId, userId)).rejects.toThrow(ForbiddenException);
    });
  });
});