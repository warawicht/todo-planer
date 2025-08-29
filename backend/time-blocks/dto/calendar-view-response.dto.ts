import { CalendarViewType } from './calendar-view.dto';
import { CalendarTimeBlockDto } from './calendar-time-block.dto';

export class CalendarViewResponseDto {
  view: CalendarViewType;
  referenceDate: Date;
  startDate: Date;
  endDate: Date;
  timeBlocks: CalendarTimeBlockDto[];
}