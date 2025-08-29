import React from 'react';
import { CalendarViewResponse, CalendarTimeBlock } from '../types/calendar.types';
import { getStartOfWeek, addDays, isSameDay } from '../utils/date.utils';

interface WeekViewProps {
  calendarData: CalendarViewResponse;
  currentDate: Date;
  onTimeBlockClick?: (timeBlock: CalendarTimeBlock) => void;
  onTimeSlotClick?: (date: Date) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  calendarData,
  currentDate,
  onTimeBlockClick,
  onTimeSlotClick
}) => {
  // Generate days for the week
  const startOfWeek = getStartOfWeek(currentDate);
  const days = Array(7).fill(null).map((_, i) => addDays(startOfWeek, i));
  
  // Generate time slots (hours from 00:00 to 23:00)
  const timeSlots = Array(24).fill(null).map((_, i) => i);
  
  // Get time blocks for a specific day
  const getTimeBlocksForDay = (day: Date): CalendarTimeBlock[] => {
    if (!calendarData?.timeBlocks) return [];
    
    return calendarData.timeBlocks.filter(block => {
      const blockDate = new Date(block.startTime);
      return isSameDay(blockDate, day);
    });
  };
  
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
      {/* Day headers */}
      <div className="grid grid-cols-8 gap-0 border-b">
        <div className="p-2 bg-gray-50"></div>
        {days.map(day => {
          const isToday = isSameDay(day, new Date());
          return (
            <div 
              key={day.toString()} 
              className={`p-2 text-center text-sm ${isToday ? 'bg-blue-50 text-blue-600 font-medium' : 'bg-gray-50'}`}
            >
              <div className="font-medium">{day.toLocaleDateString([], { weekday: 'short' })}</div>
              <div className={`text-lg ${isToday ? 'bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Time slots and blocks */}
      <div className="flex-1 overflow-auto relative">
        <div className="grid grid-cols-8 gap-0 absolute inset-0">
          {/* Time labels */}
          <div className="col-span-1">
            {timeSlots.map(hour => (
              <div key={hour} className="h-16 p-1 text-right text-xs text-gray-500 border-r">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          {days.map(day => {
            const dayTimeBlocks = getTimeBlocksForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={day.toString()} 
                className={`relative border-r ${isToday ? 'bg-blue-50' : 'bg-white'}`}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    onTimeSlotClick?.(day);
                  }
                }}
              >
                {/* Time slots */}
                {timeSlots.map(hour => (
                  <div 
                    key={hour} 
                    className="h-16 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                    onClick={() => onTimeSlotClick?.(new Date(day.setHours(hour, 0, 0, 0)))}
                  ></div>
                ))}
                
                {/* Time blocks */}
                {dayTimeBlocks.map(block => {
                  const position = calculateBlockPosition(block);
                  return (
                    <div
                      key={block.id}
                      className="absolute left-1 right-1 bg-blue-500 text-white p-1 rounded text-xs cursor-pointer hover:bg-blue-600"
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
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
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
              No time blocks scheduled for this week
            </p>
          </div>
        </div>
      )}
    </div>
  );
};