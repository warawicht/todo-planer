import { useState, useEffect, useCallback } from 'react';
import { CalendarViewType, CalendarViewResponse, CalendarViewQuery } from '../types/calendar.types';
import { addDays, addWeeks, addMonths } from '../utils/date.utils';
import { CalendarService } from '../services/calendar.service';

interface UseCalendarProps {
  initialView?: CalendarViewType;
  initialDate?: Date;
  userId?: string;
}

interface UseCalendarReturn {
  currentDate: Date;
  view: CalendarViewType;
  calendarData: CalendarViewResponse | null;
  loading: boolean;
  error: string | null;
  navigateToPrevious: () => void;
  navigateToNext: () => void;
  navigateToToday: () => void;
  changeView: (view: CalendarViewType) => void;
  goToDay: (date: Date) => void;
  refresh: () => void;
}

export const useCalendar = ({
  initialView = CalendarViewType.WEEK,
  initialDate = new Date(),
  userId
}: UseCalendarProps = {}): UseCalendarReturn => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [view, setView] = useState<CalendarViewType>(initialView);
  const [calendarData, setCalendarData] = useState<CalendarViewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarData = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const query: CalendarViewQuery = {
        view,
        referenceDate: currentDate,
        userId
      };
      
      const data = await CalendarService.getCalendarView(query);
      setCalendarData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch calendar data');
    } finally {
      setLoading(false);
    }
  }, [currentDate, view, userId]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const navigateToPrevious = useCallback(() => {
    switch (view) {
      case CalendarViewType.DAY:
        setCurrentDate(prev => addDays(prev, -1));
        break;
      case CalendarViewType.WEEK:
        setCurrentDate(prev => addWeeks(prev, -1));
        break;
      case CalendarViewType.MONTH:
        setCurrentDate(prev => addMonths(prev, -1));
        break;
    }
  }, [view]);

  const navigateToNext = useCallback(() => {
    switch (view) {
      case CalendarViewType.DAY:
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case CalendarViewType.WEEK:
        setCurrentDate(prev => addWeeks(prev, 1));
        break;
      case CalendarViewType.MONTH:
        setCurrentDate(prev => addMonths(prev, 1));
        break;
    }
  }, [view]);

  const navigateToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const changeView = useCallback((newView: CalendarViewType) => {
    setView(newView);
  }, []);

  const goToDay = useCallback((date: Date) => {
    setCurrentDate(date);
    setView(CalendarViewType.DAY);
  }, []);

  const refresh = useCallback(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  return {
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
  };
};