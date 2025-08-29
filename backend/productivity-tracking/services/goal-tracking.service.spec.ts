import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalTrackingService } from './goal-tracking.service';
import { Goal } from '../entities/goal.entity';
import { TimeEntry } from '../entities/time-entry.entity';
import { Task } from '../../tasks/entities/task.entity';

describe('GoalTrackingService', () => {
  let service: GoalTrackingService;
  let goalRepository: Repository<Goal>;
  let timeEntryRepository: Repository<TimeEntry>;
  let taskRepository: Repository<Task>;

  const mockGoalRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getCount: jest.fn(),
    })),
    remove: jest.fn(),
  };

  const mockTimeEntryRepository = {
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockTaskRepository = {
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalTrackingService,
        {
          provide: getRepositoryToken(Goal),
          useValue: mockGoalRepository,
        },
        {
          provide: getRepositoryToken(TimeEntry),
          useValue: mockTimeEntryRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<GoalTrackingService>(GoalTrackingService);
    goalRepository = module.get<Repository<Goal>>(getRepositoryToken(Goal));
    timeEntryRepository = module.get<Repository<TimeEntry>>(getRepositoryToken(TimeEntry));
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGoal', () => {
    it('should create a new goal', async () => {
      const goalData = {
        userId: 'user1',
        title: 'Complete 10 tasks',
        targetValue: 10,
        currentValue: 0,
        period: 'weekly',
        metric: 'tasks_completed',
        startDate: new Date(),
        endDate: new Date(),
      };

      mockGoalRepository.create.mockReturnValue(goalData);
      mockGoalRepository.save.mockResolvedValue(goalData);

      const result = await service.createGoal(goalData);
      expect(result).toEqual(goalData);
      expect(goalRepository.create).toHaveBeenCalledWith(goalData);
      expect(goalRepository.save).toHaveBeenCalledWith(goalData);
    });
  });

  describe('getUserGoals', () => {
    it('should retrieve user goals', async () => {
      const userId = 'user1';
      const goals = [
        {
          id: 'goal1',
          userId,
          title: 'Goal 1',
          targetValue: 10,
          currentValue: 5,
          period: 'weekly',
          metric: 'tasks_completed',
          startDate: new Date(),
          endDate: new Date(),
        },
      ];

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(goals),
      };

      mockGoalRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getUserGoals(userId);
      expect(result).toEqual(goals);
      expect(goalRepository.createQueryBuilder).toHaveBeenCalledWith('goal');
    });
  });

  describe('updateGoalProgress', () => {
    it('should update goal progress', async () => {
      const goalId = 'goal1';
      const userId = 'user1';
      const goal = {
        id: goalId,
        userId,
        title: 'Goal 1',
        targetValue: 10,
        currentValue: 5,
        period: 'weekly',
        metric: 'tasks_completed',
        startDate: new Date(),
        endDate: new Date(),
        completedAt: null,
      };

      mockGoalRepository.findOne.mockResolvedValue(goal);
      mockGoalRepository.save.mockResolvedValue({
        ...goal,
        currentValue: 8,
      });

      const result = await service.updateGoalProgress(goalId, userId);
      expect(result.currentValue).toBe(8);
      expect(goalRepository.findOne).toHaveBeenCalledWith({
        where: { id: goalId, userId },
      });
    });

    it('should mark goal as completed when target is reached', async () => {
      const goalId = 'goal1';
      const userId = 'user1';
      const goal = {
        id: goalId,
        userId,
        title: 'Goal 1',
        targetValue: 10,
        currentValue: 9,
        period: 'weekly',
        metric: 'tasks_completed',
        startDate: new Date(),
        endDate: new Date(),
        completedAt: null,
      };

      mockGoalRepository.findOne.mockResolvedValue(goal);
      mockGoalRepository.save.mockResolvedValue({
        ...goal,
        currentValue: 10,
        completedAt: expect.any(Date),
      });

      const result = await service.updateGoalProgress(goalId, userId);
      expect(result.completedAt).toBeDefined();
      expect(goalRepository.findOne).toHaveBeenCalledWith({
        where: { id: goalId, userId },
      });
    });
  });

  describe('getGoalStatistics', () => {
    it('should calculate goal statistics', async () => {
      const userId = 'user1';
      const goals = [
        {
          id: 'goal1',
          userId,
          title: 'Goal 1',
          targetValue: 10,
          currentValue: 5,
          period: 'weekly',
          metric: 'tasks_completed',
          startDate: new Date(),
          endDate: new Date(),
          completedAt: null,
        },
        {
          id: 'goal2',
          userId,
          title: 'Goal 2',
          targetValue: 10,
          currentValue: 10,
          period: 'weekly',
          metric: 'tasks_completed',
          startDate: new Date(),
          endDate: new Date(),
          completedAt: new Date(),
        },
      ];

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(goals),
      };

      mockGoalRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getGoalStatistics(userId);
      expect(result.totalGoals).toBe(2);
      expect(result.completedGoals).toBe(1);
      expect(result.completionRate).toBe(50);
    });
  });

  describe('deleteGoal', () => {
    it('should delete a goal', async () => {
      const goalId = 'goal1';
      const userId = 'user1';
      const goal = {
        id: goalId,
        userId,
        title: 'Goal 1',
        targetValue: 10,
        currentValue: 5,
        period: 'weekly',
        metric: 'tasks_completed',
        startDate: new Date(),
        endDate: new Date(),
      };

      mockGoalRepository.findOne.mockResolvedValue(goal);
      mockGoalRepository.remove.mockResolvedValue(undefined);

      await service.deleteGoal(goalId, userId);
      expect(goalRepository.findOne).toHaveBeenCalledWith({
        where: { id: goalId, userId },
      });
      expect(goalRepository.remove).toHaveBeenCalledWith(goal);
    });
  });
});