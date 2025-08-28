import React, { useState, useEffect } from 'react';
import { CalendarTimeBlock, CalendarViewResponse } from '../types/calendar.types';
import { getStartOfWeek, addDays, formatDate, isSameDay } from '../utils/date.utils';

interface WeekViewProps {
  calendarData: CalendarViewResponse | null;
  currentDate: Date;
  onTimeBlockClick?: (timeBlock: CalendarTimeBlock) => void;
  onTimeSlotClick?: (date: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const WeekView: React.FC<WeekViewProps> = ({
  calendarData,
  currentDate,
  onTimeBlockClick,
  onTimeSlotClick
}) => {
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [currentTimeIndicatorPosition, setCurrentTimeIndicatorPosition] = useState<{day: number, position: number} | null>(null);

  // Calculate week days
  useEffect(() => {
    const startOfWeek = getStartOfWeek(currentDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));
    setWeekDays(days);
  }, [currentDate]);

  // Update current time indicator position
  useEffect(() => {
    const updateCurrentTimeIndicator = () => {
      const now = new Date();
      const dayIndex = weekDays.findIndex(day => isSameDay(day, now));
      
      if (dayIndex !== -1) {
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const position = (hours + minutes / 60) * 60; // 60px per hour
        setCurrentTimeIndicatorPosition({ day: dayIndex, position });
      } else {
        setCurrentTimeIndicatorPosition(null);
      }
    };

    updateCurrentTimeIndicator();
    const interval = setInterval(updateCurrentTimeIndicator, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [weekDays]);

  // Calculate time block position
  const calculateTimeBlockPosition = (timeBlock: CalendarTimeBlock) => {
    const dayIndex = weekDays.findIndex(day => isSameDay(day, timeBlock.startTime));
    if (dayIndex === -1) return null;

    const startHours = timeBlock.startTime.getHours();
    const startMinutes = timeBlock.startTime.getMinutes();
    const endHours = timeBlock.endTime.getHours();
    const endMinutes = timeBlock.endTime.getMinutes();
    
    const top = (startHours + startMinutes / 60) * 60; // 60px per hour
    const height = ((endHours + endMinutes / 60) - (startHours + startMinutes / 60)) * 60;
    
    return { dayIndex, top, height };
  };

  // Handle time slot click
  const handleTimeSlotClick = (dayIndex: number, hour: number) => {
    if (onTimeSlotClick) {
      const clickedDate = new Date(weekDays[dayIndex]);
      clickedDate.setHours(hour, 0, 0, 0);
      onTimeSlotClick(clickedDate);
    }
  };

  // Render time blocks for the week
  const renderTimeBlocks = () => {
    if (!calendarData) return null;

    return calendarData.timeBlocks.map(timeBlock => {
      const position = calculateTimeBlockPosition(timeBlock);
      if (!position) return null;

      const { dayIndex, top, height } = position;
      
      return (
        <div
          key={timeBlock.id}
          className="absolute rounded border p-1 cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            left: `${20 + dayIndex * (100 / 7)}%`,
            width: `${100 / 7 - 1}%`,
            top: `${top}px`,
            height: `${height}px`,
            backgroundColor: timeBlock.color || '#3b82f6',
            minHeight: '20px'
          }}
          onClick={() => onTimeBlockClick?.(timeBlock)}
        >
          <div className="text-white font-medium text-xs truncate">
            {timeBlock.title}
          </div>
          <div className="text-white text-xs truncate">
            {timeBlock.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {timeBlock.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      );
    });
  };

  // Highlight current day
  const isCurrentDay = (day: Date) => {
    return isSameDay(day, new Date());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Week header */}
      <div className="flex border-b">
        <div className="w-20"></div>
        {weekDays.map((day, index) => (
          <div 
            key={index}
            className={`flex-1 text-center p-2 border-l ${isCurrentDay(day) ? 'bg-blue-50 font-bold' : ''}`}
          >
            <div className="text-sm text-gray-500">
              {day.toLocaleDateString([], { weekday: 'short' })}
            </div>
            <div className={`text-lg ${isCurrentDay(day) ? 'text-blue-600' : ''}`}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>
      
      {/* Week body */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Current time indicator */}
        {currentTimeIndicatorPosition && (
          <div 
            className="absolute h-0.5 bg-red-500 z-10"
            style={{ 
              left: `${20 + currentTimeIndicatorPosition.day * (100 / 7)}%`,
              width: `${100 / 7}%`,
              top: `${currentTimeIndicatorPosition.position}px` 
            }}
          >
            <div className="absolute -top-1.5 -left-3 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        )}
        
        {/* Time slots */}
        {HOURS.map(hour => (
          <div 
            key={hour}
            className="flex border-b relative"
            style={{ height: '60px' }}
          >
            <div className="w-20 pr-2 text-right text-sm text-gray-500 pt-1">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            <div className="flex-1 flex">
              {weekDays.map((_, dayIndex) => (
                <div 
                  key={dayIndex}
                  className="flex-1 border-l relative hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleTimeSlotClick(dayIndex, hour)}
                >
                  {/* Time block will be positioned absolutely here */}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Time blocks */}
        {renderTimeBlocks()}
      </div>
      
      {/* Handle empty state */}
      {calendarData && calendarData.timeBlocks.length === 0 && (
        <div className="flex items-center justify-center h-32 text-gray-500">
          No time blocks scheduled for this week
        </div>
      )}
    </div>
  );
};