import { render, screen } from '@testing-library/react';
import { DayView } from './DayView';
import { CalendarViewResponse, CalendarViewType } from '../types';

// Mock data for testing
const mockCalendarData: CalendarViewResponse = {
  timeBlocks: [
    {
      id: '1',
      title: 'Meeting with team',
      description: 'Weekly team meeting',
      startTime: new Date(2023, 5, 15, 10, 0),
      endTime: new Date(2023, 5, 15, 11, 0),
      color: '#3b82f6',
      taskId: 'task-1',
      taskTitle: 'Team Meeting'
    },
    {
      id: '2',
      title: 'Lunch break',
      description: 'Lunch with colleagues',
      startTime: new Date(2023, 5, 15, 12, 0),
      endTime: new Date(2023, 5, 15, 13, 0),
      color: '#10b981',
      taskId: 'task-2',
      taskTitle: 'Lunch'
    }
  ],
  startDate: new Date(2023, 5, 15),
  endDate: new Date(2023, 5, 15),
  view: CalendarViewType.DAY,
  referenceDate: new Date(2023, 5, 15),
  totalItems: 2,
  hasMore: false
};

describe('DayView', () => {
  const currentDate = new Date(2023, 5, 15);

  it('renders without crashing', () => {
    render(
      <DayView 
        calendarData={mockCalendarData} 
        currentDate={currentDate} 
      />
    );
    
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
    expect(screen.getByText('11:00 AM')).toBeInTheDocument();
  });

  it('displays time blocks correctly', () => {
    render(
      <DayView 
        calendarData={mockCalendarData} 
        currentDate={currentDate} 
      />
    );
    
    expect(screen.getByText('Meeting with team')).toBeInTheDocument();
    expect(screen.getByText('Lunch break')).toBeInTheDocument();
  });

  it('shows empty state when no time blocks', () => {
    const emptyData: CalendarViewResponse = {
      ...mockCalendarData,
      timeBlocks: []
    };
    
    render(
      <DayView 
        calendarData={emptyData} 
        currentDate={currentDate} 
      />
    );
    
    expect(screen.getByText('No time blocks scheduled for this day')).toBeInTheDocument();
  });

  it('handles null calendar data', () => {
    render(
      <DayView 
        calendarData={null as any} 
        currentDate={currentDate} 
      />
    );
    
    expect(screen.getByText('12:00 AM')).toBeInTheDocument();
  });
});