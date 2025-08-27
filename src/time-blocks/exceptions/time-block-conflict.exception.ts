import { HttpException, HttpStatus } from '@nestjs/common';
import { TimeBlock } from '../entities/time-block.entity';

export class TimeBlockConflictException extends HttpException {
  constructor(conflicts: Partial<TimeBlock>[]) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: 'Time block conflicts with existing time blocks',
        conflicts: conflicts.map(conflict => ({
          id: conflict.id,
          title: conflict.title,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
        })),
      },
      HttpStatus.CONFLICT,
    );
  }
}