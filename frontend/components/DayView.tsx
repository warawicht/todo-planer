import React from 'react';
import { CalendarViewResponse, CalendarTimeBlock } from '../types/calendar.types';

interface DayViewProps {
  calendarData: CalendarViewResponse;
  currentDate: Date;
  onTimeBlockClick?: (timeBlock: CalendarTimeBlock) => void;
  onTimeSlotClick?: (date: Date) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  calendarData,
  currentDate,
  onTimeBlockClick,
  onTimeSlotClick
}) => {
  // Generate time slots (hours from 00:00 to 23:00)
  const timeSlots = Array(24).fill(null).map((_, i) => i);
  
  // Get time blocks for the current day
  const dayTimeBlocks = calendarData?.timeBlocks || [];
  
  // Calculate time block position
  const calculateBlockPosition = (block: CalendarTimeBlock) => {
    const startHour = block.startTime.getHours();
    const startMinute = block.startTime.getMinutes();
    const endHour = block.endTime.getHours();
    const endMinute = block.endTime.getMinutes();
    
    const top = (startHour * 60 + startMinute) * (60 / 60); // 60px per hour
    const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) * (60 / 60);
    
    return { top, height };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Day header */}
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-xl font-semibold">
          {currentDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </h2>
      </div>
      
      {/* Time slots and blocks */}
      <div className="flex-1 overflow-auto relative">
        <div className="absolute inset-0">
          {/* Time slots */}
          {timeSlots.map(hour => (
            <div 
              key={hour} 
              className="h-16 border-b border-gray-100 flex cursor-pointer hover:bg-gray-50"
              onClick={() => onTimeSlotClick?.(new Date(currentDate.setHours(hour, 0, 0, 0)))}
            >
              <div className="w-16 p-1 text-right text-xs text-gray-500 border-r">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              <div className="flex-1"></div>
            </div>
          ))}
          
          {/* Time blocks */}
          {dayTimeBlocks.map(block => {
            const position = calculateBlockPosition(block);
            return (
              <div
                key={block.id}
                className="absolute left-16 right-4 bg-blue-500 text-white p-2 rounded cursor-pointer hover:bg-blue-600"
                style={{
                  top: `${position.top}px`,
                  height: `${position.height}px`,
                }}
                onClick={() => onTimeBlockClick?.(block)}
              >
                <div className="font-medium truncate">{block.title}</div>
                <div className="truncate">
                  {block.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {block.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {block.description && (
                  <div className="text-xs mt-1 truncate">{block.description}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Empty state */}
      {dayTimeBlocks.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No time blocks</h3>
            <p className="mt-1 text-sm text-gray-500">
              No time blocks scheduled for this day
            </p>
          </div>
        </div>
      )}
    </div>
  );
};