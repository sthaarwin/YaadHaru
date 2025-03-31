
import React, { useState, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  addDays,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns';
import { cn } from '@/lib/utils';

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
  
  return (
    <div className="w-full">
      {/* Calendar header with weekdays */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 p-1">
        {calendarDays.map((day, i) => (
          <div
            key={i}
            className={cn(
              "calendar-day cursor-pointer flex flex-col",
              !isSameMonth(day, currentDate) && "opacity-40",
              selectedDate && isSameDay(day, selectedDate) && "selected",
              isToday(day) && "today"
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
            <div className="flex-grow mt-1">
              {/* Will be populated with memory indicators */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
