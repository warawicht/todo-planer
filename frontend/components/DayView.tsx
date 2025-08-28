import React, { useState, useEffect, useRef } from 'react';
import { CalendarTimeBlock, CalendarViewResponse } from '../types/calendar.types';
import { formatTime, isSameDay } from '../utils/date.utils';

interface DayViewProps {
  calendarData: CalendarViewResponse | null;
  currentDate: Date;
  onTimeBlockClick?: (timeBlock: CalendarTimeBlock) => void;
  onTimeSlotClick?: (date: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const DayView: React.FC<DayViewProps> = ({
  calendarData,
  currentDate,
  onTimeBlockClick,
  onTimeSlotClick
}) => {
  const [currentTimeIndicatorPosition, setCurrentTimeIndicatorPosition] = useState<number>(0);
  const dayViewRef = useRef<HTMLDivElement>(null);

  // Update current time indicator position
  useEffect(() => {
    const updateCurrentTimeIndicator = () => {
      const now = new Date();
      if (isSameDay(now, currentDate)) {
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const position = (hours + minutes / 60) * 60; // 60px per hour
        setCurrentTimeIndicatorPosition(position);
      }
    };

    updateCurrentTimeIndicator();
    const interval = setInterval(updateCurrentTimeIndicator, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [currentDate]);

  // Calculate time block position
  const calculateTimeBlockPosition = (timeBlock: CalendarTimeBlock) => {
    const startHours = timeBlock.startTime.getHours();
    const startMinutes = timeBlock.startTime.getMinutes();
    const endHours = timeBlock.endTime.getHours();
    const endMinutes = timeBlock.endTime.getMinutes();
    
    const top = (startHours + startMinutes / 60) * 60; // 60px per hour
    const height = ((endHours + endMinutes / 60) - (startHours + startMinutes / 60)) * 60;
    
    return { top, height };
  };

  // Handle time slot click
  const handleTimeSlotClick = (hour: number) => {
    if (onTimeSlotClick) {
      const clickedDate = new Date(currentDate);
      clickedDate.setHours(hour, 0, 0, 0);
      onTimeSlotClick(clickedDate);
    }
  };

  // Render time blocks for the current day
  const renderTimeBlocks = () => {
    if (!calendarData) return null;

    return calendarData.timeBlocks
      .filter(tb => isSameDay(tb.startTime, currentDate))
      .map(timeBlock => {
        const position = calculateTimeBlockPosition(timeBlock);
        
        return (
          <div
            key={timeBlock.id}
            className="absolute left-20 right-2 rounded border p-2 cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              top: `${position.top}px`,
              height: `${position.height}px`,
              backgroundColor: timeBlock.color || '#3b82f6',
              minHeight: '20px'
            }}
            onClick={() => onTimeBlockClick?.(timeBlock)}
          >
            <div className="text-white font-medium text-sm truncate">
              {timeBlock.title}
            </div>
            <div className="text-white text-xs truncate">
              {formatTime(timeBlock.startTime)} - {formatTime(timeBlock.endTime)}
            </div>
          </div>
        );
      });
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={dayViewRef}
        className="flex-1 overflow-y-auto relative"
        style={{ minHeight: '1440px' }} // 24 hours * 60px
      >
        {/* Current time indicator */}
        {isSameDay(new Date(), currentDate) && (
          <div 
            className="absolute left-20 right-2 h-0.5 bg-red-500 z-10"
            style={{ top: `${currentTimeIndicatorPosition}px` }}
          >
            <div className="absolute -top-1.5 -left-3 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        )}
        
        {/* Time slots */}
        {HOURS.map(hour => (
          <div 
            key={hour}
            className="flex border-b relative hover:bg-gray-50 cursor-pointer"
            style={{ height: '60px' }}
            onClick={() => handleTimeSlotClick(hour)}
          >
            <div className="w-20 pr-2 text-right text-sm text-gray-500 pt-1">
              {formatTime(new Date(2023, 0, 1, hour, 0))}
            </div>
            <div className="flex-1 border-l pl-2 pt-1">
              {/* Time block will be positioned absolutely here */}
            </div>
          </div>
        ))}
        
        {/* Time blocks */}
        {renderTimeBlocks()}
      </div>
      
      {/* Handle empty state */}
      {calendarData && calendarData.timeBlocks.length === 0 && (
        <div className="flex items-center justify-center h-32 text-gray-500">
          No time blocks scheduled for this day
        </div>
      )}
    </div>
  );
};