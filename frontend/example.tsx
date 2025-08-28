import React from 'react';
import { Calendar } from './components';
import { CalendarViewType, CalendarTimeBlock } from './types';

// Example usage of the Calendar component
const CalendarExample: React.FC = () => {
  const userId = 'user-123'; // In a real app, this would come from authentication

  const handleTimeBlockClick = (timeBlock: CalendarTimeBlock) => {
    console.log('Time block clicked:', timeBlock);
    // Open a modal or navigate to time block details
  };

  const handleTimeSlotClick = (date: Date) => {
    console.log('Time slot clicked:', date);
    // Open a form to create a new time block
  };

  const handleDayClick = (date: Date) => {
    console.log('Day clicked:', date);
    // Navigate to day view or open day details
  };

  const handleViewChange = (view: CalendarViewType) => {
    console.log('View changed to:', view);
    // Save preference to backend
  };

  const handleDateChange = (date: Date) => {
    console.log('Date changed to:', date);
    // Update URL or save to state
  };

  return (
    <div className="h-screen p-4 bg-gray-100">
      <Calendar
        userId={userId}
        initialView={CalendarViewType.WEEK}
        initialDate={new Date()}
        onTimeBlockClick={handleTimeBlockClick}
        onTimeSlotClick={handleTimeSlotClick}
        onDayClick={handleDayClick}
        onViewChange={handleViewChange}
        onDateChange={handleDateChange}
      />
    </div>
  );
};

export default CalendarExample;