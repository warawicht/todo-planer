export class CalendarViewPreferenceResponseDto {
  defaultView: 'day' | 'week' | 'month';
  firstDayOfWeek: number; // 0 for Sunday, 1 for Monday, etc.
  showWeekends: boolean;
  timeFormat: '12h' | '24h';
  updatedAt: Date;
}