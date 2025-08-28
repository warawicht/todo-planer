import React from 'react';
import { render, screen } from '@testing-library/react';
import { MonthView } from './MonthView';
import { CalendarViewResponse, CalendarViewType } from '../types';

// Mock data for testing
const mockCalendarData: CalendarViewResponse = {
  timeBlocks: [
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly team sync',
      startTime: new Date(2023, 5, 15),
      endTime: new Date(2023, 5, 15),
      color: '#3b82f6',
      taskId: 'task-1',
      taskTitle: 'Team Meeting'
    },
    {
      id: '2',
      title: 'Client Call',
      description: 'Quarterly review with client',
      startTime: new Date(2023, 5, 20),
      endTime: new Date(2023, 5, 20),
      color: '#10b981',
      taskId: 'task-2',
      taskTitle: 'Client Call'
    }
  ],
  startDate: new Date(2023, 5, 1),
  endDate: new Date(2023, 5, 30),
  view: CalendarViewType.MONTH,
  referenceDate: new Date(2023, 5, 15),
  totalItems: 2,
  hasMore: false
};

describe('MonthView', () => {
  const currentDate = new Date(2023, 5, 15);

  it('renders without crashing', () => {
    render(
      <MonthView 
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
      <MonthView 
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
      <MonthView 
        calendarData={emptyData} 
        currentDate={currentDate} 
      />
    );
    
    expect(screen.getByText('No time blocks scheduled for this month')).toBeInTheDocument();
  });

  it('handles null calendar data', () => {
    render(
      <MonthView 
        calendarData={null} 
        currentDate={currentDate} 
      />
    );
    
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });
});