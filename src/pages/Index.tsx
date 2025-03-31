
import React, { useState, useEffect } from 'react';
import YaadHeader from '@/components/YaadHeader';
import Calendar from '@/components/Calendar';
import MemoryDetail from '@/components/MemoryDetail';
import { ThemeProvider } from '@/hooks/use-theme';
import { addMonths, subMonths } from 'date-fns';
import { Memory } from '@/types/memory';
import { getMemoriesForDate, saveMemoriesForDate } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const { toast } = useToast();
  
  // Handle month navigation
  const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleTodayClick = () => setCurrentDate(new Date());
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Load memories for the selected date
    const dateMemories = getMemoriesForDate(date);
    setMemories(dateMemories);
  };
  
  // Handle closing memory detail
  const handleCloseMemoryDetail = () => {
    setSelectedDate(null);
  };
  
  // Handle saving memories
  const handleSaveMemories = (updatedMemories: Memory[]) => {
    if (selectedDate) {
      saveMemoriesForDate(selectedDate, updatedMemories);
      setMemories(updatedMemories);
      toast({
        title: "Memories saved",
        description: "Your memories have been saved successfully."
      });
      // Close the detail view after saving
      setSelectedDate(null);
    }
  };
  
  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen flex flex-col">
        <YaadHeader
          currentMonth={currentDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onTodayClick={handleTodayClick}
        />
        
        <main className="flex-1 container max-w-6xl mx-auto my-4 px-4">
          <div className="bg-card rounded-xl shadow-md overflow-hidden material-shadow-sm">
            <Calendar
              currentDate={currentDate}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
          </div>
        </main>
        
        {selectedDate && (
          <MemoryDetail
            date={selectedDate}
            memories={memories}
            onClose={handleCloseMemoryDetail}
            onSave={handleSaveMemories}
          />
        )}
        
        <footer className="py-4 border-t text-center text-sm text-muted-foreground">
          yaadHaru © {new Date().getFullYear()} - Your memories, beautifully preserved
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Index;
