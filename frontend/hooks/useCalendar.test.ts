import { renderHook, act } from '@testing-library/react';
import { useCalendar } from './useCalendar';
import { CalendarViewType } from '../types';

// Mock the CalendarService
jest.mock('../services/calendar.service', () => ({
  CalendarService: {
    getCalendarView: jest.fn(),
    getViewPreference: jest.fn(),
    updateViewPreference: jest.fn()
  }
}));

describe('useCalendar', () => {
  const userId = 'user-123';
  const initialDate = new Date(2023, 5, 15); // June 15, 2023

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useCalendar({ userId }));
    
    expect(result.current.currentDate).toBeInstanceOf(Date);
    expect(result.current.view).toBe(CalendarViewType.WEEK);
    expect(result.current.calendarData).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('accepts initial values', () => {
    const { result } = renderHook(() => 
      useCalendar({ 
        userId, 
        initialView: CalendarViewType.MONTH, 
        initialDate 
      })
    );
    
    expect(result.current.currentDate).toEqual(initialDate);
    expect(result.current.view).toBe(CalendarViewType.MONTH);
  });

  it('navigates to previous period', () => {
    const { result } = renderHook(() => 
      useCalendar({ 
        userId, 
        initialDate 
      })
    );
    
    // Test day view
    act(() => {
      result.current.changeView(CalendarViewType.DAY);
    });
    
    act(() => {
      result.current.navigateToPrevious();
    });
    
    expect(result.current.currentDate).toEqual(new Date(2023, 5, 14)); // June 14
    
    // Test week view
    act(() => {
      result.current.changeView(CalendarViewType.WEEK);
      result.current.navigateToPrevious();
    });
    
    expect(result.current.currentDate).toEqual(new Date(2023, 5, 1)); // June 1 (previous week)
    
    // Test month view
    act(() => {
      result.current.changeView(CalendarViewType.MONTH);
      result.current.navigateToPrevious();
    });
    
    expect(result.current.currentDate).toEqual(new Date(2023, 4, 15)); // May 15
  });

  it('navigates to next period', () => {
    const { result } = renderHook(() => 
      useCalendar({ 
        userId, 
        initialDate 
      })
    );
    
    // Test day view
    act(() => {
      result.current.changeView(CalendarViewType.DAY);
    });
    
    act(() => {
      result.current.navigateToNext();
    });
    
    expect(result.current.currentDate).toEqual(new Date(2023, 5, 16)); // June 16
    
    // Test week view
    act(() => {
      result.current.changeView(CalendarViewType.WEEK);
      result.current.navigateToNext();
    });
    
    expect(result.current.currentDate).toEqual(new Date(2023, 5, 29)); // June 29 (next week)
    
    // Test month view
    act(() => {
      result.current.changeView(CalendarViewType.MONTH);
      result.current.navigateToNext();
    });
    
    expect(result.current.currentDate).toEqual(new Date(2023, 6, 15)); // July 15
  });

  it('navigates to today', () => {
    const { result } = renderHook(() => 
      useCalendar({ 
        userId, 
        initialDate: new Date(2020, 0, 1) // Some date in the past
      })
    );
    
    act(() => {
      result.current.navigateToToday();
    });
    
    // Should be close to today's date
    const today = new Date();
    const current = result.current.currentDate;
    
    expect(current.getFullYear()).toBe(today.getFullYear());
    expect(current.getMonth()).toBe(today.getMonth());
    expect(current.getDate()).toBe(today.getDate());
  });

  it('changes view', () => {
    const { result } = renderHook(() => useCalendar({ userId }));
    
    act(() => {
      result.current.changeView(CalendarViewType.DAY);
    });
    
    expect(result.current.view).toBe(CalendarViewType.DAY);
    
    act(() => {
      result.current.changeView(CalendarViewType.MONTH);
    });
    
    expect(result.current.view).toBe(CalendarViewType.MONTH);
  });

  it('goes to specific day', () => {
    const { result } = renderHook(() => useCalendar({ userId }));
    
    const targetDate = new Date(2023, 11, 25); // December 25, 2023
    
    act(() => {
      result.current.goToDay(targetDate);
    });
    
    expect(result.current.currentDate).toEqual(targetDate);
    expect(result.current.view).toBe(CalendarViewType.DAY);
  });

  it('handles missing userId gracefully', () => {
    const { result } = renderHook(() => useCalendar({}));
    
    expect(result.current.currentDate).toBeInstanceOf(Date);
    expect(result.current.view).toBe(CalendarViewType.WEEK);
  });
});