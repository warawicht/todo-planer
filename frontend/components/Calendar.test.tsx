import { render, screen } from '@testing-library/react';
import { Calendar } from './Calendar';
import { CalendarViewType } from '../types';

// Mock the useCalendar hook
jest.mock('../hooks/useCalendar', () => ({
  useCalendar: () => ({
    currentDate: new Date(2023, 5, 15),
    view: CalendarViewType.WEEK,
    calendarData: {
      timeBlocks: [],
      startDate: new Date(2023, 5, 11),
      endDate: new Date(2023, 5, 17),
      view: CalendarViewType.WEEK,
      referenceDate: new Date(2023, 5, 15),
      totalItems: 0,
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

describe('Calendar', () => {
  const userId = 'user-123';

  it('renders without crashing', () => {
    render(<Calendar userId={userId} />);
    
    // Check that navigation buttons are rendered
    expect(screen.getByLabelText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Next')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    
    // Check that view switcher buttons are rendered
    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('Week')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
  });

  it('displays the correct date range', () => {
    render(<Calendar userId={userId} />);
    
    // Check that the date range is displayed
    expect(screen.getByText('Jun 11 - Jun 17')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    // Mock loading state
    jest.mock('../hooks/useCalendar', () => ({
      useCalendar: () => ({
        currentDate: new Date(2023, 5, 15),
        view: CalendarViewType.WEEK,
        calendarData: null,
        loading: true,
        error: null,
        navigateToPrevious: jest.fn(),
        navigateToNext: jest.fn(),
        navigateToToday: jest.fn(),
        changeView: jest.fn(),
        goToDay: jest.fn(),
        refresh: jest.fn()
      })
    }));
    
    render(<Calendar userId={userId} />);
    
    // Check that loading spinner is displayed
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error state', () => {
    // Mock error state
    jest.mock('../hooks/useCalendar', () => ({
      useCalendar: () => ({
        currentDate: new Date(2023, 5, 15),
        view: CalendarViewType.WEEK,
        calendarData: null,
        loading: false,
        error: 'Failed to load calendar data',
        navigateToPrevious: jest.fn(),
        navigateToNext: jest.fn(),
        navigateToToday: jest.fn(),
        changeView: jest.fn(),
        goToDay: jest.fn(),
        refresh: jest.fn()
      })
    }));
    
    render(<Calendar userId={userId} />);
    
    // Check that error message is displayed
    expect(screen.getByText('Error: Failed to load calendar data')).toBeInTheDocument();
  });
});