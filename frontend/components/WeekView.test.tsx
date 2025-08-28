import React from 'react';
import { render, screen } from '@testing-library/react';
import { WeekView } from './WeekView';
import { CalendarViewResponse, CalendarViewType } from '../types';

// Mock data for testing
const mockCalendarData: CalendarViewResponse = {
  timeBlocks: [
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly team sync',
      startTime: new Date(2023, 5, 12, 9, 0), // Monday
      endTime: new Date(2023, 5, 12, 10, 0),
      color: '#3b82f6',
      taskId: 'task-1',
      taskTitle: 'Team Meeting'
    },
    {
      id: '2',
      title: 'Client Call',
      description: 'Quarterly review with client',
      startTime: new Date(2023, 5, 14, 14, 0), // Wednesday
      endTime: new Date(2023, 5, 14, 15, 0),
      color: '#10b981',
      taskId: 'task-2',
      taskTitle: 'Client Call'
    }
  ],
  startDate: new Date(2023, 5, 11), // Sunday
  endDate: new Date(2023, 5, 17), // Saturday
  view: CalendarViewType.WEEK,
  referenceDate: new Date(2023, 5, 14), // Wednesday
  totalItems: 2,
  hasMore: false
};

describe('WeekView', () => {
  const currentDate = new Date(2023, 5, 14); // Wednesday

  it('renders without crashing', () => {
    render(
      <WeekView 
        calendarData={mockCalendarData} 
        currentDate={currentDate} 
      />
    );
    
    // Check that weekdays are rendered
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('displays time blocks correctly', () => {
    render(
      <WeekView 
        calendarData={mockCalendarData} 
        currentDate={currentDate} 
      />
    );
    
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('Client Call')).toBeInTheDocument();
  });

  it('shows empty state when no time blocks', () => {
    const emptyData: CalendarViewResponse = {
      ...mockCalendarData,
      timeBlocks: []
    };
    
    render(
      <WeekView 
        calendarData={emptyData} 
        currentDate={currentDate} 
      />
    );
    
    expect(screen.getByText('No time blocks scheduled for this week')).toBeInTheDocument();
  });

  it('handles null calendar data', () => {
    render(
      <WeekView 
        calendarData={null} 
        currentDate={currentDate} 
      />
    );
    
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });
});