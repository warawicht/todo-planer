import React from 'react';
import { CalendarViewResponse, CalendarTimeBlock } from '../types/calendar.types';
import { getWeeksInMonth, isSameDay } from '../utils/date.utils';

interface MonthViewProps {
  calendarData: CalendarViewResponse;
  currentDate: Date;
  onDayClick?: (date: Date) => void;
  onTimeBlockClick?: (timeBlock: CalendarTimeBlock) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  calendarData,
  currentDate,
  onDayClick,
  onTimeBlockClick
}) => {
  // Get time blocks for a specific day
  const getTimeBlocksForDay = (day: Date): CalendarTimeBlock[] => {
    if (!calendarData?.timeBlocks) return [];
    
    return calendarData.timeBlocks.filter(block => {
      const blockDate = new Date(block.startTime);
      return isSameDay(blockDate, day);
    });
  };

  // Render a single day cell
  const renderDay = (day: Date, isCurrentMonth: boolean) => {
    const dayTimeBlocks = getTimeBlocksForDay(day);
    const isToday = isSameDay(day, new Date());
    
    return (
      <div
        key={day.toString()}
        className={`min-h-24 p-1 border border-gray-200 ${
          isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
        } ${isToday ? 'bg-blue-50' : ''}`}
        onClick={() => onDayClick?.(day)}
      >
        <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
          {day.getDate()}
        </div>
        <div className="mt-1 space-y-1">
          {dayTimeBlocks.slice(0, 3).map(block => (
            <div
              key={block.id}
              className="text-xs p-1 bg-blue-100 rounded truncate cursor-pointer hover:bg-blue-200"
              onClick={(e) => {
                e.stopPropagation();
                onTimeBlockClick?.(block);
              }}
            >
              {block.title}
            </div>
          ))}
          {dayTimeBlocks.length > 3 && (
            <div className="text-xs text-gray-500">
              +{dayTimeBlocks.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

  // Generate calendar grid
  const weeks = getWeeksInMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  return (
    <div className="h-full flex flex-col">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 gap-0">
        {weeks.map((week) => (
          week.map((day) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            return renderDay(day, isCurrentMonth);
          })
        ))}
      </div>
      
      {/* Empty state */}
      {calendarData.timeBlocks.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No time blocks</h3>
            <p className="mt-1 text-sm text-gray-500">
              No time blocks scheduled for this month
            </p>
          </div>
        </div>
      )}
    </div>
  );
};