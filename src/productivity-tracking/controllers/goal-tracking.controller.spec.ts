import { Test, TestingModule } from '@nestjs/testing';
import { GoalTrackingController } from './goal-tracking.controller';
import { GoalTrackingService } from '../services/goal-tracking.service';
import { Goal } from '../entities/goal.entity';

describe('GoalTrackingController', () => {
  let controller: GoalTrackingController;
  let service: GoalTrackingService;

  const mockGoalTrackingService = {
    createGoal: jest.fn(),
    getUserGoals: jest.fn(),
    updateGoalProgress: jest.fn(),
    getGoalStatistics: jest.fn(),
    deleteGoal: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalTrackingController],
      providers: [
        {
          provide: GoalTrackingService,
          useValue: mockGoalTrackingService,
        },
      ],
    }).compile();

    controller = module.get<GoalTrackingController>(GoalTrackingController);
    service = module.get<GoalTrackingService>(GoalTrackingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createGoal', () => {
    it('should create a new goal', async () => {
      const createGoalDto = {
        userId: 'user1',
        title: 'Complete 10 tasks',
        targetValue: 10,
        currentValue: 0,
        period: 'weekly',
        metric: 'tasks_completed',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      };

      const goal: Goal = {
        id: 'goal1',
        ...createGoalDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
        user: null,
      };

      mockGoalTrackingService.createGoal.mockResolvedValue(goal);

      const result = await controller.createGoal(createGoalDto);
      expect(result).toEqual(goal);
      expect(service.createGoal).toHaveBeenCalledWith(createGoalDto);
    });
  });

  describe('getUserGoals', () => {
    it('should retrieve user goals', async () => {
      const userId = 'user1';
      const goals: Goal[] = [
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
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: null,
          user: null,
        },
      ];

      mockGoalTrackingService.getUserGoals.mockResolvedValue(goals);

      const result = await controller.getUserGoals(userId, false);
      expect(result).toEqual(goals);
      expect(service.getUserGoals).toHaveBeenCalledWith(userId, false);
    });
  });

  describe('updateGoalProgress', () => {
    it('should update goal progress', async () => {
      const goalId = 'goal1';
      const updateGoalDto = {
        userId: 'user1',
        currentValue: 8,
      };

      const updatedGoal: Goal = {
        id: goalId,
        userId: 'user1',
        title: 'Goal 1',
        targetValue: 10,
        currentValue: 8,
        period: 'weekly',
        metric: 'tasks_completed',
        startDate: new Date(),
        endDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
        user: null,
      };

      mockGoalTrackingService.updateGoalProgress.mockResolvedValue(updatedGoal);

      const result = await controller.updateGoalProgress(goalId, updateGoalDto);
      expect(result).toEqual(updatedGoal);
      expect(service.updateGoalProgress).toHaveBeenCalledWith(goalId, updateGoalDto.userId);
    });
  });

  describe('getGoalStatistics', () => {
    it('should calculate goal statistics', async () => {
      const userId = 'user1';
      const statistics = {
        totalGoals: 5,
        activeGoals: 3,
        completedGoals: 2,
        overdueGoals: 0,
        completionRate: 40,
      };

      mockGoalTrackingService.getGoalStatistics.mockResolvedValue(statistics);

      const result = await controller.getGoalStatistics(userId);
      expect(result).toEqual(statistics);
      expect(service.getGoalStatistics).toHaveBeenCalledWith(userId);
    });
  });

  describe('deleteGoal', () => {
    it('should delete a goal', async () => {
      const goalId = 'goal1';
      const userId = 'user1';

      mockGoalTrackingService.deleteGoal.mockResolvedValue(undefined);

      await controller.deleteGoal(goalId, userId);
      expect(service.deleteGoal).toHaveBeenCalledWith(goalId, userId);
    });
  });
});