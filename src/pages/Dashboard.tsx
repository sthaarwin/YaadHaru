import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import YaadHeader from "@/components/YaadHeader";
import Calendar from "@/components/Calendar";
import MemoryDetail from "@/components/MemoryDetail";
import { Memory } from "@/types/memory";
import { useToast } from "@/hooks/use-toast";
import { authAPI, memoryAPI } from "@/api/strapiService";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Check if user is logged in
  useEffect(() => {
    const currentUser = authAPI.getCurrentUser();
    if (!currentUser) {
      navigate("/auth");
    }
  }, [navigate]);

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    setIsLoading(true);
    
    try {
      const dateMemories = await memoryAPI.getMemoriesForDate(date);
      setMemories(dateMemories);
    } catch (error) {
      console.error('Error loading memories:', error);
      toast({
        title: "Error",
        description: "Failed to load memories. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCloseMemoryDetail = () => {
    setSelectedDate(null);
  };
  
  const handleSaveMemories = async (updatedMemories: Memory[]) => {
    if (selectedDate) {
      setIsLoading(true);
      
      try {
        const success = await memoryAPI.saveMemoriesForDate(selectedDate, updatedMemories);
        
        if (success) {
          setMemories(updatedMemories);
          toast({
            title: "Memories saved",
            description: "Your memories have been saved successfully."
          });
        } else {
          toast({
            title: "Save failed",
            description: "Failed to save memories. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error saving memories:', error);
        toast({
          title: "Error",
          description: "An error occurred while saving your memories.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
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
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
