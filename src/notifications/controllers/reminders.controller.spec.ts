import { Test, TestingModule } from '@nestjs/testing';
import { RemindersController } from './reminders.controller';
import { CreateReminderDto } from '../dto/create-reminder.dto';
import { UpdateReminderDto } from '../dto/update-reminder.dto';

describe('RemindersController', () => {
  let controller: RemindersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemindersController],
    }).compile();

    controller = module.get<RemindersController>(RemindersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all reminders for a user', async () => {
      const userId = 'user123';
      const skip = 0;
      const take = 10;
      
      const result = await controller.findAll(skip, take, userId);
      
      expect(result).toEqual({
        message: 'Get all reminders',
        userId,
        skip,
        take,
      });
    });
  });

  describe('findOne', () => {
    it('should return a specific reminder', async () => {
      const id = 'reminder123';
      const userId = 'user123';
      
      const result = await controller.findOne(id, userId);
      
      expect(result).toEqual({
        message: 'Get reminder',
        id,
        userId,
      });
    });
  });

  describe('create', () => {
    it('should create a new reminder', async () => {
      const userId = 'user123';
      const createDto: CreateReminderDto = {
        taskId: 'task123',
        timeBefore: '5_min',
        enabled: true,
      };
      
      const result = await controller.create(createDto, userId);
      
      expect(result).toEqual({
        message: 'Create reminder',
        createReminderDto: createDto,
        userId,
      });
    });
  });

  describe('update', () => {
    it('should update a reminder', async () => {
      const id = 'reminder123';
      const userId = 'user123';
      const updateDto: UpdateReminderDto = {
        enabled: false,
      };
      
      const result = await controller.update(id, updateDto, userId);
      
      expect(result).toEqual({
        message: 'Update reminder',
        id,
        updateReminderDto: updateDto,
        userId,
      });
    });
  });

  describe('remove', () => {
    it('should remove a reminder', async () => {
      const id = 'reminder123';
      const userId = 'user123';
      
      const result = await controller.remove(id, userId);
      
      expect(result).toEqual({
        message: 'Delete reminder',
        id,
        userId,
      });
    });
  });

  describe('bulkCreate', () => {
    it('should bulk create reminders', async () => {
      const userId = 'user123';
      const createDtos: CreateReminderDto[] = [
        {
          taskId: 'task123',
          timeBefore: '5_min',
          enabled: true,
        },
        {
          taskId: 'task456',
          timeBefore: '1_hour',
          enabled: true,
        },
      ];
      
      const result = await controller.bulkCreate(createDtos, userId);
      
      expect(result).toEqual({
        message: 'Bulk create reminders',
        createReminderDtos: createDtos,
        userId,
      });
    });
  });

  describe('bulkUpdate', () => {
    it('should bulk update reminders', async () => {
      const userId = 'user123';
      const updateDtos: UpdateReminderDto[] = [
        {
          enabled: false,
        },
      ];
      
      const result = await controller.bulkUpdate(updateDtos, userId);
      
      expect(result).toEqual({
        message: 'Bulk update reminders',
        updateReminderDtos: updateDtos,
        userId,
      });
    });
  });

  describe('bulkDelete', () => {
    it('should bulk delete reminders', async () => {
      const userId = 'user123';
      const ids = ['reminder1', 'reminder2'];
      
      const result = await controller.bulkDelete(ids, userId);
      
      expect(result).toEqual({
        message: 'Bulk delete reminders',
        ids,
        userId,
      });
    });
  });
});