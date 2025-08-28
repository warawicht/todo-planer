import React from 'react';
import { render, screen } from '@testing-library/react';
import { Calendar } from './Calendar';
import { CalendarViewType } from '../types';

// Mock the useCalendar hook for performance testing
jest.mock('../hooks/useCalendar', () => ({
  useCalendar: () => ({
    currentDate: new Date(2023, 5, 15),
    view: CalendarViewType.WEEK,
    calendarData: {
      timeBlocks: Array.from({ length: 1000 }, (_, i) => ({
        id: `block-${i}`,
        title: `Time Block ${i}`,
        description: `Description for time block ${i}`,
        startTime: new Date(2023, 5, 15, i % 24, 0),
        endTime: new Date(2023, 5, 15, (i % 24) + 1, 0),
        color: '#3b82f6',
        taskId: `task-${i}`,
        taskTitle: `Task ${i}`
      })),
      startDate: new Date(2023, 5, 11),
      endDate: new Date(2023, 5, 17),
      view: CalendarViewType.WEEK,
      referenceDate: new Date(2023, 5, 15),
      totalItems: 1000,
      hasMore: false
    },
    loading: false,
    error: null,
    navigateToPrevious: jest.fn(),
    navigateToNext: jest.fn(),
    navigateToToday: jest.fn(),
    changeView: jest.fn(),
    goToDay: jest.fn(),
    refresh: jest.fn()
  })
}));

describe('Calendar Performance', () => {
  const userId = 'user-123';

  it('renders large dataset efficiently', async () => {
    const startTime = performance.now();
    
    render(<Calendar userId={userId} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render 1000 time blocks in under 100ms
    expect(renderTime).toBeLessThan(100);
    
    // Should display the calendar view
    expect(screen.getByText('Jun 11 - Jun 17')).toBeInTheDocument();
  });

  it('handles view switching efficiently', async () => {
    const { rerender } = render(<Calendar userId={userId} />);
    
    // Mock view change
    jest.mock('../hooks/useCalendar', () => ({
      useCalendar: () => ({
        currentDate: new Date(2023, 5, 15),
        view: CalendarViewType.MONTH,
        calendarData: {
          timeBlocks: Array.from({ length: 1000 }, (_, i) => ({
            id: `block-${i}`,
            title: `Time Block ${i}`,
            description: `Description for time block ${i}`,
            startTime: new Date(2023, 5, 15, i % 24, 0),
            endTime: new Date(2023, 5, 15, (i % 24) + 1, 0),
            color: '#3b82f6',
            taskId: `task-${i}`,
            taskTitle: `Task ${i}`
          })),
          startDate: new Date(2023, 5, 1),
          endDate: new Date(2023, 5, 30),
          view: CalendarViewType.MONTH,
          referenceDate: new Date(2023, 5, 15),
          totalItems: 1000,
          hasMore: false
        },
        loading: false,
        error: null,
        navigateToPrevious: jest.fn(),
        navigateToNext: jest.fn(),
        navigateToToday: jest.fn(),
        changeView: jest.fn(),
        goToDay: jest.fn(),
        refresh: jest.fn()
      })
    }));
    
    const startTime = performance.now();
    
    rerender(<Calendar userId={userId} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should switch views efficiently
    expect(renderTime).toBeLessThan(50);
  });

  it('handles navigation efficiently', async () => {
    const mockNavigate = jest.fn();
    
    jest.mock('../hooks/useCalendar', () => ({
      useCalendar: () => ({
        currentDate: new Date(2023, 5, 15),
        view: CalendarViewType.WEEK,
        calendarData: {
          timeBlocks: Array.from({ length: 100 }, (_, i) => ({
            id: `block-${i}`,
            title: `Time Block ${i}`,
            description: `Description for time block ${i}`,
            startTime: new Date(2023, 5, 15, i % 24, 0),
            endTime: new Date(2023, 5, 15, (i % 24) + 1, 0),
            color: '#3b82f6',
            taskId: `task-${i}`,
            taskTitle: `Task ${i}`
          })),
          startDate: new Date(2023, 5, 11),
          endDate: new Date(2023, 5, 17),
          view: CalendarViewType.WEEK,
          referenceDate: new Date(2023, 5, 15),
          totalItems: 100,
          hasMore: false
        },
        loading: false,
        error: null,
        navigateToPrevious: mockNavigate,
        navigateToNext: mockNavigate,
        navigateToToday: mockNavigate,
        changeView: jest.fn(),
        goToDay: jest.fn(),
        refresh: jest.fn()
      })
    }));
    
    render(<Calendar userId={userId} />);
    
    const startTime = performance.now();
    
    // Simulate navigation
    screen.getByLabelText('Previous').click();
    screen.getByLabelText('Next').click();
    screen.getByText('Today').click();
    
    const endTime = performance.now();
    const navigationTime = endTime - startTime;
    
    // Should handle navigation efficiently
    expect(navigationTime).toBeLessThan(30);
    expect(mockNavigate).toHaveBeenCalledTimes(3);
  });
});