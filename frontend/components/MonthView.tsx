import React, { useState, useEffect } from 'react';
import { CalendarTimeBlock, CalendarViewResponse } from '../types/calendar.types';
import { getWeeksInMonth, isSameDay, addDays } from '../utils/date.utils';

interface MonthViewProps {
  calendarData: CalendarViewResponse | null;
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
  const [weeks, setWeeks] = useState<Date[][]>([]);
  const [timeBlocksByDay, setTimeBlocksByDay] = useState<Record<string, CalendarTimeBlock[]>>({});

  // Calculate weeks for the month
  useEffect(() => {
    const newWeeks = getWeeksInMonth(currentDate.getFullYear(), currentDate.getMonth());
    setWeeks(newWeeks);
  }, [currentDate]);

  // Group time blocks by day
  useEffect(() => {
    if (!calendarData) return;

    const grouped: Record<string, CalendarTimeBlock[]> = {};
    
    calendarData.timeBlocks.forEach(timeBlock => {
      const dateKey = timeBlock.startTime.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(timeBlock);
    });
    
    setTimeBlocksByDay(grouped);
  }, [calendarData]);

  // Get time blocks for a specific day
  const getTimeBlocksForDay = (day: Date): CalendarTimeBlock[] => {
    const dateKey = day.toISOString().split('T')[0]; // YYYY-MM-DD
    return timeBlocksByDay[dateKey] || [];
  };

  // Check if a day is in the current month
  const isCurrentMonth = (day: Date): boolean => {
    return day.getMonth() === currentDate.getMonth() && 
           day.getFullYear() === currentDate.getFullYear();
  };

  // Check if a day is today
  const isToday = (day: Date): boolean => {
    return isSameDay(day, new Date());
  };

  // Handle day click
  const handleDayClick = (day: Date) => {
    if (onDayClick) {
      onDayClick(day);
    }
  };

  // Render time blocks for a day (limited to 3 for display)
  const renderDayTimeBlocks = (day: Date) => {
    const timeBlocks = getTimeBlocksForDay(day);
    const limitedBlocks = timeBlocks.slice(0, 3);
    
    return (
      <div className="space-y-1 mt-1">
        {limitedBlocks.map((timeBlock, index) => (
          <div
            key={`${timeBlock.id}-${index}`}
            className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-90"
            style={{ backgroundColor: timeBlock.color || '#3b82f6' }}
            onClick={(e) => {
              e.stopPropagation();
              onTimeBlockClick?.(timeBlock);
            }}
          >
            <span className="text-white truncate">
              {timeBlock.title}
            </span>
          </div>
        ))}
        {timeBlocks.length > 3 && (
          <div className="text-xs text-gray-500">
            +{timeBlocks.length - 3} more
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Month header */}
      <div className="grid grid-cols-7 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center p-2 text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* Month body */}
      <div className="flex-1 overflow-y-auto">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7">
            {week.map((day, dayIndex) => {
              const timeBlocks = getTimeBlocksForDay(day);
              const isCurrent = isCurrentMonth(day);
              const isTodayDay = isToday(day);
              
              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`min-h-24 border p-1 cursor-pointer hover:bg-gray-50 ${
                    !isCurrent ? 'bg-gray-50 text-gray-400' : ''
                  } ${isTodayDay ? 'bg-blue-50' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className={`text-right p-1 ${
                    isTodayDay ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto' : ''
                  }`}>
                    {day.getDate()}
                  </div>
                  {renderDayTimeBlocks(day)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Handle empty state */}
      {calendarData && calendarData.timeBlocks.length === 0 && (
        <div className="flex items-center justify-center h-32 text-gray-500">
          No time blocks scheduled for this month
        </div>
      )}
    </div>
  );
};