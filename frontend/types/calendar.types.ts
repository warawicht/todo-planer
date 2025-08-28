export interface CalendarTimeBlockPosition {
  top: number;    // For day/week views (pixels from top)
  left: number;   // For week view (column position)
  height: number; // For day/week views (block height in pixels)
  width: number;  // For week view (block width as percentage)
}

export interface CalendarTimeBlock {
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
}

export enum CalendarViewType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month'
}

export interface CalendarViewResponse {
  timeBlocks: CalendarTimeBlock[];
  startDate: Date;
  endDate: Date;
  view: CalendarViewType;
  referenceDate: Date;
  totalItems: number;
  hasMore: boolean;
}

export interface CalendarViewQuery {
  view: CalendarViewType;
  referenceDate: Date;
  userId?: string;
}

export interface CalendarViewPreference {
  id: string;
  userId: string;
  defaultView: CalendarViewType;
  updatedAt: Date;
}