
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import YaadHeader from "@/components/YaadHeader";
import Calendar from "@/components/Calendar";
import MemoryDetail from "@/components/MemoryDetail";
import { Memory } from "@/types/memory";
import { getMemoriesForDate, saveMemoriesForDate } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const { toast } = useToast();
  
  // Check if user is logged in
  useEffect(() => {
    const currentUser = localStorage.getItem("yaadHaru_currentUser");
    if (!currentUser) {
      navigate("/auth");
    }
  }, [navigate]);

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
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <YaadHeader />
      <div className="container mx-auto p-4 flex-grow">
        <Calendar 
          currentDate={currentDate}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
        
        {selectedDate && (
          <MemoryDetail
            date={selectedDate}
            memories={memories}
            onClose={handleCloseMemoryDetail}
            onSave={handleSaveMemories}
          />
        )}
      </div>
    </div>
  );
}
