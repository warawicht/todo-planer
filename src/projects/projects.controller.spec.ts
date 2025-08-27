import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

const mockProjectsService = {
  create: jest.fn(),
  findAllWithPagination: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  assignTaskToProject: jest.fn(),
};

const mockRequest = {
  user: {
    id: 'user-id',
  },
};

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
        description: 'Test Description',
        color: '#FF0000',
      };

      const project = new Project();
      Object.assign(project, { ...createProjectDto, id: 'project-id', userId: 'user-id' });

      mockProjectsService.create.mockResolvedValue(project);

      const result = await controller.create(mockRequest as any, createProjectDto);

      expect(result).toEqual({
        success: true,
        data: project,
        message: 'Project created successfully'
      });
      expect(service.create).toHaveBeenCalledWith('user-id', createProjectDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated projects', async () => {
      const query = { page: 1, limit: 10 };
      const projects = [new Project()];
      const total = 1;

      mockProjectsService.findAllWithPagination.mockResolvedValue({ projects, total });

      const result = await controller.findAll(mockRequest as any, query);

      expect(result).toEqual({
        data: projects,
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      });
      expect(service.findAllWithPagination).toHaveBeenCalledWith('user-id', 1, 10, undefined);
    });
  });

  describe('findOne', () => {
    it('should return a single project', async () => {
      const projectId = 'project-id';
      const project = new Project();
      project.id = projectId;

      mockProjectsService.findOne.mockResolvedValue(project);

      const result = await controller.findOne(mockRequest as any, projectId);

      expect(result).toEqual({
        success: true,
        data: project
      });
      expect(service.findOne).toHaveBeenCalledWith(projectId, 'user-id');
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const projectId = 'project-id';
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Project',
        description: 'Updated Description',
      };

      const project = new Project();
      Object.assign(project, { ...updateProjectDto, id: projectId, userId: 'user-id' });

      mockProjectsService.update.mockResolvedValue(project);

      const result = await controller.update(mockRequest as any, projectId, updateProjectDto);

      expect(result).toEqual({
        success: true,
        data: project,
        message: 'Project updated successfully'
      });
      expect(service.update).toHaveBeenCalledWith(projectId, 'user-id', updateProjectDto);
    });
  });

  describe('remove', () => {
    it('should delete a project', async () => {
      const projectId = 'project-id';

      mockProjectsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockRequest as any, projectId);

      expect(result).toEqual({
        success: true,
        message: 'Project deleted successfully'
      });
      expect(service.remove).toHaveBeenCalledWith(projectId, 'user-id');
    });
  });

  describe('assignTaskToProject', () => {
    it('should assign a task to a project', async () => {
      const projectId = 'project-id';
      const taskId = 'task-id';
      const task = new Task();
      task.id = taskId;
      task.projectId = projectId;

      mockProjectsService.assignTaskToProject.mockResolvedValue(task);

      const result = await controller.assignTaskToProject(mockRequest as any, projectId, taskId);

      expect(result).toEqual({
        success: true,
        data: task,
        message: 'Task assigned to project successfully'
      });
      expect(service.assignTaskToProject).toHaveBeenCalledWith(projectId, taskId, 'user-id');
    });
  });
});