import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date> {
  transform(value: string): Date {
    if (!value) {
      throw new BadRequestException('Date string is required');
    }

    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date string');
    }
    
    return date;
  }
}