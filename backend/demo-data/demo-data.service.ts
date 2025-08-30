import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';
import { TagsService } from '../tags/tags.service';
import { TimeBlocksService } from '../time-blocks/time-blocks.service';
import { User } from '../users/user.entity';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { Tag } from '../tags/entities/tag.entity';
import { TimeBlock } from '../time-blocks/entities/time-block.entity';
import { CreateProjectDto } from '../projects/dto/create-project.dto';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';
import { CreateTimeBlockDto } from '../time-blocks/dto/create-time-block.dto';

@Injectable()
export class DemoDataService {
  private readonly logger = new Logger(DemoDataService.name);
  
  // Sample data arrays
  private readonly firstNames = ["Alex", "Taylor", "Jordan", "Casey", "Riley", "Morgan", "Jamie", "Cameron"];
  private readonly lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"];
  private readonly projectNames = ["Website Redesign", "Mobile App Development", "Marketing Campaign", "Product Launch", "System Migration"];
  private readonly projectDescriptions = [
    "Complete redesign of company website",
    "Development of new mobile application",
    "Planning and execution of marketing campaign",
    "Launch of new product line",
    "Migration to new infrastructure"
  ];
  private readonly taskTitles = [
    "Research competitors",
    "Create wireframes",
    "Write documentation",
    "Test functionality",
    "Review code",
    "Design user interface",
    "Implement backend API",
    "Configure deployment pipeline",
    "Conduct user testing",
    "Optimize performance"
  ];
  private readonly taskDescriptions = [
    "Analyze competing products in the market",
    "Design initial wireframes for key pages",
    "Create comprehensive documentation for the project",
    "Perform thorough testing of all features",
    "Review code for quality and best practices",
    "Design intuitive user interface",
    "Implement REST API endpoints",
    "Set up CI/CD pipeline for deployment",
    "Conduct usability testing with target users",
    "Optimize application performance"
  ];
  private readonly tagNames = ["Design", "Development", "Marketing", "Urgent", "Review", "Meeting", "Research", "Planning"];
  private readonly colorPalette = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6", "#1abc9c", "#d35400", "#34495e"];
  private readonly timeBlockTitles = [
    "Design meeting",
    "Code review session",
    "Planning meeting",
    "Development work",
    "Testing phase",
    "Client presentation",
    "Research time",
    "Documentation work"
  ];
  private readonly timeBlockDescriptions = [
    "Team meeting to discuss design concepts",
    "Review code for quality and best practices",
    "Planning session for upcoming sprint",
    "Focused development work on assigned tasks",
    "Testing phase for new features",
    "Presentation of progress to client",
    "Research time for new technologies",
    "Creating and updating documentation"
  ];

  constructor(
    private readonly usersService: UsersService,
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
    private readonly tagsService: TagsService,
    private readonly timeBlocksService: TimeBlocksService,
  ) {}

  /**
   * Create demo data including users, projects, tasks, tags, and time blocks
   */
  async createDemoData(): Promise<void> {
    try {
      this.logger.log('Starting demo data creation...');
      
      // Check if we're in a production environment
      if (process.env.NODE_ENV === 'production') {
        this.logger.warn('Demo data creation is disabled in production environment');
        throw new BadRequestException('Demo data creation is not allowed in production environment');
      }
      
      // Additional security check - only allow demo data creation if explicitly enabled
      if (process.env.ENABLE_DEMO_DATA !== 'true') {
        this.logger.warn('Demo data creation is not enabled. Set ENABLE_DEMO_DATA=true to enable.');
        throw new BadRequestException('Demo data creation is not enabled. Set ENABLE_DEMO_DATA=true to enable.');
      }
      
      // Create demo users
      const users = await this.createDemoUsers();
      
      // Create tags
      const tags = await this.createDemoTags(users);
      
      // For each user, create projects, tasks, and time blocks
      for (const user of users) {
        const projects = await this.createDemoProjects(user);
        const userTasks = await this.createDemoTasks(user, projects, tags);
        await this.createDemoTimeBlocks(user, userTasks);
      }
      
      this.logger.log('Demo data creation completed successfully');
    } catch (error) {
      this.logger.error('Error creating demo data', error.stack);
      throw error;
    }
  }

  /**
   * Create demo users
   */
  private async createDemoUsers(): Promise<User[]> {
    const users: User[] = [];
    const demoPassword = 'DemoPassword123!';
    
    for (let i = 0; i < 3; i++) {
      const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
      const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
      const email = `demo${i + 1}@example.com`;
      
      try {
        const user = await this.usersService.create({
          email,
          password: demoPassword,
          firstName,
          lastName,
          isEmailVerified: true,
          isActive: true,
        });
        
        users.push(user);
        this.logger.log(`Created demo user: ${firstName} ${lastName} (${email})`);
      } catch (error) {
        this.logger.error(`Error creating demo user ${email}:`, error.message);
        // Continue with other users even if one fails
      }
    }
    
    if (users.length === 0) {
      this.logger.warn('No demo users were created successfully');
    }
    
    return users;
  }

  /**
   * Create demo tags
   */
  private async createDemoTags(users: User[]): Promise<Tag[]> {
    const tags: Tag[] = [];
    
    // Use the first user to create tags
    const userId = users[0]?.id;
    if (!userId) {
      this.logger.warn('No users available to create tags');
      return tags;
    }
    
    for (const tagName of this.tagNames) {
      try {
        const color = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
        const tag = await this.tagsService.create({
          name: tagName,
          color,
          userId,
        });
        
        tags.push(tag);
        this.logger.log(`Created demo tag: ${tagName}`);
      } catch (error) {
        this.logger.error(`Error creating demo tag ${tagName}:`, error.message);
      }
    }
    
    return tags;
  }

  /**
   * Create demo projects for a user
   */
  private async createDemoProjects(user: User): Promise<Project[]> {
    const projects: Project[] = [];
    
    const numProjects = 3 + Math.floor(Math.random() * 3); // 3-5 projects
    
    for (let i = 0; i < numProjects; i++) {
      const projectName = this.projectNames[Math.floor(Math.random() * this.projectNames.length)];
      const projectDescription = this.projectDescriptions[Math.floor(Math.random() * this.projectDescriptions.length)];
      const color = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
      
      try {
        const createProjectDto: CreateProjectDto = {
          name: projectName,
          description: projectDescription,
          color,
        };
        
        const project = await this.projectsService.create(user.id, createProjectDto);
        projects.push(project);
        this.logger.log(`Created demo project for user ${user.email}: ${projectName}`);
      } catch (error) {
        this.logger.error(`Error creating demo project for user ${user.email}:`, error.message);
      }
    }
    
    return projects;
  }

  /**
   * Create demo tasks for a user
   */
  private async createDemoTasks(user: User, projects: Project[], tags: Tag[]): Promise<Task[]> {
    const tasks: Task[] = [];
    
    const numTasks = 15 + Math.floor(Math.random() * 11); // 15-25 tasks
    
    for (let i = 0; i < numTasks; i++) {
      const taskTitle = this.taskTitles[Math.floor(Math.random() * this.taskTitles.length)];
      const taskDescription = this.taskDescriptions[Math.floor(Math.random() * this.taskDescriptions.length)];
      const priority = Math.floor(Math.random() * 5); // 0-4
      
      // Randomly assign to a project (80% chance)
      const projectId = Math.random() < 0.8 ? projects[Math.floor(Math.random() * projects.length)]?.id : undefined;
      
      // Generate a random due date within the next 30 days
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30));
      
      try {
        const createTaskDto: CreateTaskDto = {
          title: taskTitle,
          description: taskDescription,
          priority,
          dueDate: dueDate.toISOString(),
          projectId,
        };
        
        // Associate with tags (60% chance)
        let tagIds: string[] = [];
        if (Math.random() < 0.6 && tags.length > 0) {
          const numTags = 1 + Math.floor(Math.random() * 2); // 1-2 tags
          const selectedTags = this.getRandomItems(tags, numTags);
          tagIds = selectedTags.map(tag => tag.id);
        }
        
        const task = await this.tasksService.create(user.id, {
          ...createTaskDto,
          tagIds
        });
        tasks.push(task);
        this.logger.log(`Created demo task for user ${user.email}: ${taskTitle}`);
      } catch (error) {
        this.logger.error(`Error creating demo task for user ${user.email}:`, error.message);
      }
    }
    
    return tasks;
  }

  /**
   * Create demo time blocks for a user
   */
  private async createDemoTimeBlocks(user: User, tasks: Task[]): Promise<void> {
    const numTimeBlocks = 10 + Math.floor(Math.random() * 11); // 10-20 time blocks
    
    for (let i = 0; i < numTimeBlocks; i++) {
      const timeBlockTitle = this.timeBlockTitles[Math.floor(Math.random() * this.timeBlockTitles.length)];
      const timeBlockDescription = this.timeBlockDescriptions[Math.floor(Math.random() * this.timeBlockDescriptions.length)];
      const color = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
      
      // Generate random start time within the next 7 days
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + Math.floor(Math.random() * 7));
      startTime.setHours(Math.floor(Math.random() * 12) + 8, 0, 0, 0); // Between 8am and 8pm
      
      // Generate end time (30-120 minutes after start)
      const duration = 30 + Math.floor(Math.random() * 91); // 30-120 minutes
      const endTime = new Date(startTime.getTime() + duration * 60000);
      
      // Randomly associate with a task (70% chance)
      const taskId = Math.random() < 0.7 && tasks.length > 0 ? tasks[Math.floor(Math.random() * tasks.length)]?.id : undefined;
      
      try {
        const createTimeBlockDto: CreateTimeBlockDto = {
          title: timeBlockTitle,
          description: timeBlockDescription,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          color,
          taskId,
        };
        
        await this.timeBlocksService.create(user.id, createTimeBlockDto);
        this.logger.log(`Created demo time block for user ${user.email}: ${timeBlockTitle}`);
      } catch (error) {
        // Time block conflicts are expected, so we'll just log them as debug messages
        if (error.name === 'TimeBlockConflictException') {
          this.logger.debug(`Time block conflict for user ${user.email}: ${timeBlockTitle}`);
        } else {
          this.logger.error(`Error creating demo time block for user ${user.email}:`, error.message);
        }
      }
    }
  }

  /**
   * Get random items from an array
   */
  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }
}