import React from 'react';
import { useCalendar } from '../hooks/useCalendar';
import { CalendarViewType, CalendarTimeBlock } from '../types/calendar.types';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';

interface CalendarProps {
  userId: string;
  initialView?: CalendarViewType;
  initialDate?: Date;
  onTimeBlockClick?: (timeBlock: CalendarTimeBlock) => void;
  onTimeSlotClick?: (date: Date) => void;
  onDayClick?: (date: Date) => void;
  onViewChange?: (view: CalendarViewType) => void;
  onDateChange?: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  userId,
  initialView = CalendarViewType.WEEK,
  initialDate = new Date(),
  onTimeBlockClick,
  onTimeSlotClick,
  onDayClick,
  onViewChange,
  onDateChange
}) => {
  const {
    currentDate,
    view,
    calendarData,
    loading,
    error,
    navigateToPrevious,
    navigateToNext,
    navigateToToday,
    changeView,
    goToDay,
    refresh
  } = useCalendar({
    initialView,
    initialDate,
    userId
  });

  // Handle view change
  const handleViewChange = (newView: CalendarViewType) => {
    changeView(newView);
    onViewChange?.(newView);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Only handle keyboard events when not in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        navigateToPrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        navigateToNext();
        break;
      case 't':
      case 'T':
        event.preventDefault();
        navigateToToday();
        break;
      case 'd':
      case 'D':
        event.preventDefault();
        handleViewChange(CalendarViewType.DAY);
        break;
      case 'w':
      case 'W':
        event.preventDefault();
        handleViewChange(CalendarViewType.WEEK);
        break;
      case 'm':
      case 'M':
        event.preventDefault();
        handleViewChange(CalendarViewType.MONTH);
        break;
      default:
        break;
    }
  };

  // Handle date change
  const handleDateChange = (newDate: Date) => {
    goToDay(newDate);
    onDateChange?.(newDate);
  };

  // Format current date for display
  const formatDateRange = () => {
    if (!calendarData) return '';

    const startDate = calendarData.startDate.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
    
    const endDate = calendarData.endDate.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
    
    return `${startDate} - ${endDate}`;
  };

  return (
    <div 
      className="flex flex-col h-full bg-white rounded-lg shadow"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <button
            onClick={navigateToPrevious}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Previous"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={navigateToToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Today
          </button>
          
          <button
            onClick={navigateToNext}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Next"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <h2 className="text-xl font-semibold">
            {formatDateRange()}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* View Switcher */}
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => handleViewChange(CalendarViewType.DAY)}
              className={`px-3 py-2 text-sm font-medium rounded-l-md ${
                view === CalendarViewType.DAY
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => handleViewChange(CalendarViewType.WEEK)}
              className={`px-3 py-2 text-sm font-medium ${
                view === CalendarViewType.WEEK
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => handleViewChange(CalendarViewType.MONTH)}
              className={`px-3 py-2 text-sm font-medium rounded-r-md ${
                view === CalendarViewType.MONTH
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
          </div>
          
          <button
            onClick={refresh}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Refresh"
            disabled={loading}
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Calendar Body */}
      <div className="flex-1 overflow-hidden">
        {error && (
          <div className="p-4 text-center text-red-500">
            Error: {error}
          </div>
        )}
        
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {!loading && !error && (
          <>
            {view === CalendarViewType.DAY && (
              <DayView
                calendarData={calendarData}
                currentDate={currentDate}
                onTimeBlockClick={onTimeBlockClick}
                onTimeSlotClick={onTimeSlotClick}
              />
            )}
            
            {view === CalendarViewType.WEEK && (
              <WeekView
                calendarData={calendarData}
                currentDate={currentDate}
                onTimeBlockClick={onTimeBlockClick}
                onTimeSlotClick={onTimeSlotClick}
              />
            )}
            
            {view === CalendarViewType.MONTH && (
              <MonthView
                calendarData={calendarData}
                currentDate={currentDate}
                onDayClick={onDayClick}
                onTimeBlockClick={onTimeBlockClick}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};