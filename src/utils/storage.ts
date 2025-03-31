
import { DailyMemories, Memory } from '@/types/memory';
import { format, parse } from 'date-fns';

// Key for storing memories in localStorage
const STORAGE_KEY = 'yaadHaru-memories';

// Format date to string key
export const formatDateKey = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Parse string key to date
export const parseDateKey = (dateKey: string): Date => {
  return parse(dateKey, 'yyyy-MM-dd', new Date());
};

// Save all memories to localStorage
export const saveMemories = (memories: DailyMemories): void => {
  try {
    // Convert Date objects to strings before storing
    const memoriesToStore: Record<string, any[]> = {};
    
    Object.entries(memories).forEach(([dateKey, memoryArray]) => {
      memoriesToStore[dateKey] = memoryArray.map(memory => ({
        ...memory,
        createdAt: memory.createdAt.toISOString()
      }));
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoriesToStore));
  } catch (error) {
    console.error('Failed to save memories to localStorage', error);
  }
};

// Load all memories from localStorage
export const loadMemories = (): DailyMemories => {
  try {
    const memoryData = localStorage.getItem(STORAGE_KEY);
    if (!memoryData) return {};
    
    const parsedData = JSON.parse(memoryData);
    const memories: DailyMemories = {};
    
    // Convert string dates back to Date objects
    Object.entries(parsedData).forEach(([dateKey, memoryArray]: [string, any[]]) => {
      memories[dateKey] = memoryArray.map(memory => ({
        ...memory,
        createdAt: new Date(memory.createdAt)
      }));
    });
    
    return memories;
  } catch (error) {
    console.error('Failed to load memories from localStorage', error);
    return {};
  }
};

// Save memories for a specific date
export const saveMemoriesForDate = (date: Date, memories: Memory[]): void => {
  const dateKey = formatDateKey(date);
  const allMemories = loadMemories();
  
  allMemories[dateKey] = memories;
  saveMemories(allMemories);
};

// Get memories for a specific date
export const getMemoriesForDate = (date: Date): Memory[] => {
  const dateKey = formatDateKey(date);
  const allMemories = loadMemories();
  
  return allMemories[dateKey] || [];
};

// Check if a date has memories
export const hasMemoriesForDate = (date: Date): boolean => {
  const memories = getMemoriesForDate(date);
  return memories.length > 0;
};

// Get dates with memories for a month
export const getDatesWithMemoriesForMonth = (month: Date): Set<string> => {
  const allMemories = loadMemories();
  const year = month.getFullYear();
  const monthNum = month.getMonth();
  
  return new Set(
    Object.keys(allMemories).filter(dateKey => {
      const memoryDate = parseDateKey(dateKey);
      return memoryDate.getFullYear() === year && memoryDate.getMonth() === monthNum;
    })
  );
};
