import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query, 
  UseGuards,
  Req,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createProjectDto: CreateProjectDto
  ) {
    const userId = req.user.id;
    const project = await this.projectsService.create(userId, createProjectDto);
    return {
      success: true,
      data: project,
      message: 'Project created successfully'
    };
  }

  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ProjectQueryDto
  ) {
    const userId = req.user.id;
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100); // Max 100 items per page
    
    // Handle isArchived filtering
    let isArchived: boolean | undefined;
    if (query.isArchived !== undefined) {
      isArchived = query.isArchived === true;
    }
    
    const { projects, total } = await this.projectsService.findAllWithPagination(
      userId, 
      page, 
      limit, 
      isArchived
    );
    
    return {
      data: projects,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  @Get(':id')
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string
  ) {
    const userId = req.user.id;
    const project = await this.projectsService.findOne(id, userId);
    return {
      success: true,
      data: project
    };
  }

  @Put(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto
  ) {
    const userId = req.user.id;
    const project = await this.projectsService.update(id, userId, updateProjectDto);
    return {
      success: true,
      data: project,
      message: 'Project updated successfully'
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string
  ) {
    const userId = req.user.id;
    await this.projectsService.remove(id, userId);
    return {
      success: true,
      message: 'Project deleted successfully'
    };
  }
  
  @Put(':id/tasks/:taskId')
  async assignTaskToProject(
    @Req() req: AuthenticatedRequest,
    @Param('id') projectId: string,
    @Param('taskId') taskId: string
  ) {
    const userId = req.user.id;
    const task = await this.projectsService.assignTaskToProject(projectId, taskId, userId);
    return {
      success: true,
      data: task,
      message: 'Task assigned to project successfully'
    };
  }
}