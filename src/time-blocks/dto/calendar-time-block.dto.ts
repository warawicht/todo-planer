import { TimeBlock } from '../entities/time-block.entity';

export class CalendarTimeBlockPosition {
  top: number;    // For day/week views (pixels from top)
  left: number;   // For week view (column position)
  height: number; // For day/week views (block height in pixels)
  width: number;  // For week view (block width as percentage)
}

export class CalendarTimeBlockDto {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  color: string;
  taskId: string;
  taskTitle: string; // For quick display without additional queries
  
  // View-specific properties
  position?: CalendarTimeBlockPosition;
  displayDate?: string; // For month view (YYYY-MM-DD)
  
  static fromTimeBlock(timeBlock: TimeBlock, taskTitle?: string): CalendarTimeBlockDto {
    return {
      id: timeBlock.id,
      title: timeBlock.title,
      description: timeBlock.description,
      startTime: timeBlock.startTime,
      endTime: timeBlock.endTime,
      color: timeBlock.color,
      taskId: timeBlock.taskId,
      taskTitle: taskTitle || (timeBlock.task ? timeBlock.task.title : ''),
    };
  }
}