
export const isAuthenticated = (): boolean => {
  const user = localStorage.getItem("yaadHaru_currentUser");
  return !!user;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("yaadHaru_currentUser");
  if (user) {
    return JSON.parse(user);
  }
  return null;
};

export const getUserMemories = (userId: string) => {
  const userMemoriesKey = `yaadHaru_memories_${userId}`;
  const memories = localStorage.getItem(userMemoriesKey);
  
  if (memories) {
    return JSON.parse(memories);
  }
  
  return {}; // Return empty object if no memories found
};

export const saveUserMemory = (userId: string, dateKey: string, memories: any[]) => {
  const userMemoriesKey = `yaadHaru_memories_${userId}`;
  const userMemories = getUserMemories(userId) || {};
  
  userMemories[dateKey] = memories;
  localStorage.setItem(userMemoriesKey, JSON.stringify(userMemories));
};
