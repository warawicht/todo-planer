import { HttpException, HttpStatus } from '@nestjs/common';

export class NotificationException extends HttpException {
  constructor(message: string, errorCode: string) {
    super(
      {
        status: 'error',
        message,
        errorCode,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class NotificationNotFoundException extends HttpException {
  constructor(id: string) {
    super(
      {
        status: 'error',
        message: `Notification with ID ${id} not found`,
        errorCode: 'NOTIFICATION_NOT_FOUND',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class NotificationPreferenceNotFoundException extends HttpException {
  constructor(userId: string) {
    super(
      {
        status: 'error',
        message: `Notification preferences for user ${userId} not found`,
        errorCode: 'NOTIFICATION_PREFERENCE_NOT_FOUND',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.NOT_FOUND,
    );
  }
}