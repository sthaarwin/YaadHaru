import React, { useState, useMemo, useEffect } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  subMonths,
  addMonths
} from 'date-fns';
import { cn } from '@/lib/utils';
import { formatDateKey, memoryAPI } from '@/api/strapiService';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarProps {
  currentDate: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  selectedDate,
  onDateSelect
}) => {
  const [datesWithMemories, setDatesWithMemories] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch dates with memories for the current month
  useEffect(() => {
    const fetchDatesWithMemories = async () => {
      setIsLoading(true);
      try {
        const dates = await memoryAPI.getDatesWithMemoriesForMonth(currentDate);
        setDatesWithMemories(dates);
      } catch (error) {
        console.error("Error fetching dates with memories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatesWithMemories();
  }, [currentDate]);

  // Get days to display in calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const days = [];
    let day = startDate;
    
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    return days;
  }, [currentDate]);
  
  // Week day headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
    <div key={day} className="text-center font-semibold text-sm py-2">
      {day}
    </div>
  ));

  // Check if a day has memories
  const hasMemories = (day: Date): boolean => {
    const dateKey = formatDateKey(day);
    return datesWithMemories.has(dateKey);
  };

  // Handle month navigation
  const handlePreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    // If you can update this in parent component:
    // setCurrentDate(newDate);
    onDateSelect(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    // If you can update this in parent component:
    // setCurrentDate(newDate);
    onDateSelect(newDate);
  };

  const handleTodayClick = () => {
    const today = new Date();
    // If you can update this in parent component:
    // setCurrentDate(today);
    onDateSelect(today);
  };
  
  return (
    <div className="w-full">
      {/* Calendar header with navigation */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleTodayClick}>
            <CalendarDays size={16} className="mr-1" /> Today
          </Button>
        </div>
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>
      
      {/* Week days header */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 p-1">
        {calendarDays.map((day, i) => (
          <div
            key={i}
            className={cn(
              "calendar-day cursor-pointer flex flex-col p-1 h-16 rounded-md transition-colors",
              !isSameMonth(day, currentDate) && "opacity-40",
              selectedDate && isSameDay(day, selectedDate) && "bg-secondary/30",
              isToday(day) && "border border-primary"
            )}
            onClick={() => onDateSelect(day)}
          >
            <div className="text-right">
              <span className={cn(
                "inline-flex items-center justify-center rounded-full w-6 h-6 text-xs",
                isToday(day) && "bg-primary text-white font-bold"
              )}>
                {format(day, 'd')}
              </span>
            </div>
            <div className="flex-grow mt-1 flex items-end justify-center">
              {/* Memory indicator */}
              {isLoading ? (
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
              ) : hasMemories(day) && (
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
