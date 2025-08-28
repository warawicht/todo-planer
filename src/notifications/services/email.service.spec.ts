import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { EmailTemplateService } from './email-template.service';
import { Notification } from '../entities/notification.entity';

describe('EmailService', () => {
  let service: EmailService;
  let templateService: EmailTemplateService;

  const mockEmailTemplateService = {
    renderTemplate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: EmailTemplateService,
          useValue: mockEmailTemplateService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    templateService = module.get<EmailTemplateService>(EmailTemplateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmailNotification', () => {
    it('should send an email notification successfully', async () => {
      const notification = new Notification();
      notification.userId = 'user-123';
      notification.title = 'Test Notification';
      notification.priority = 2;

      const context = { userName: 'John Doe' };
      const htmlContent = '<html><body>Test Email</body></html>';

      mockEmailTemplateService.renderTemplate.mockResolvedValue(htmlContent);

      const result = await service.sendEmailNotification(notification, context);

      expect(result).toBe(true);
      expect(templateService.renderTemplate).toHaveBeenCalledWith('task-reminder', {
        ...context,
        taskTitle: notification.title,
        dueDate: expect.any(String),
        priority: notification.priority,
      });
    });

    it('should return false when email sending fails', async () => {
      const notification = new Notification();
      notification.userId = 'user-123';
      notification.title = 'Test Notification';

      mockEmailTemplateService.renderTemplate.mockRejectedValue(new Error('Template error'));

      const result = await service.sendEmailNotification(notification);

      expect(result).toBe(false);
    });
  });
});