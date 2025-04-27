import { Memory, DailyMemories } from '@/types/memory';
import { format } from 'date-fns';
import strapiClient, { checkBackendAvailability, checkMemoriesApiAvailability } from './strapiClient';
import * as localStorageService from '@/utils/storage';

export const authAPI = {
  login: async (email: string, password: string) => {
    // Check if backend is available before attempting API call
    const backendAvailable = await checkBackendAvailability();
    
    if (backendAvailable) {
      try {
        const response = await strapiClient.post('/api/auth/local', {
          identifier: email,
          password,
        });
        if (response.data.jwt) {
          localStorage.setItem('yaadHaru_jwt', response.data.jwt);
          localStorage.setItem('yaadHaru_currentUser', JSON.stringify(response.data.user));
        }
        return response.data;
      } catch (error) {
        console.error('Login error:', error);
        // Fall through to local auth if API call fails
      }
    }
    
    // Fallback to local authentication when backend is unavailable
    const users = JSON.parse(localStorage.getItem("yaadHaru_users") || "[]");
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
      };
      localStorage.setItem("yaadHaru_currentUser", JSON.stringify(userData));
      return { user: userData };
    }
    
    throw new Error("Invalid credentials");
  },

  register: async (name: string, email: string, password: string) => {
    // Check if backend is available before attempting API call
    const backendAvailable = await checkBackendAvailability();
    
    if (backendAvailable) {
      try {
        // Create a unique username from the email (without @ and domain part)
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
        
        const response = await strapiClient.post('/api/auth/local/register', {
          username, 
          email,
          password,
        });
        
        if (response.data.jwt) {
           localStorage.setItem('yaadHaru_jwt', response.data.jwt);
          
           try {
            await strapiClient.put(`/api/users/${response.data.user.id}`, {
              firstName: name.split(' ')[0],
              lastName: name.split(' ').slice(1).join(' ') || ''
            });
          } catch (profileError) {
            console.error('Error updating user profile:', profileError);
          }
          
           localStorage.setItem('yaadHaru_currentUser', JSON.stringify({
            ...response.data.user,
            name: name,  
          }));
        }
        
        return response.data;
      } catch (error: any) {
        console.error('Registration error:', error);
        
        if (error.response?.data?.error?.message) {
          throw new Error(error.response.data.error.message);
        }
        
        throw error;
      }
    }
    
     const users = JSON.parse(localStorage.getItem("yaadHaru_users") || "[]");
    
    const userExists = users.some((u: any) => u.email === email);
    if (userExists) {
      throw new Error("A user with this email already exists");
    }
    
    const newUser = {
      id: `local_${Date.now()}`,
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem("yaadHaru_users", JSON.stringify(users));
    
    const userData = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };
    localStorage.setItem("yaadHaru_currentUser", JSON.stringify(userData));
    
    return { user: userData };
  },

  logout: () => {
    localStorage.removeItem('yaadHaru_jwt');
    localStorage.removeItem('yaadHaru_currentUser');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('yaadHaru_currentUser');
    return user ? JSON.parse(user) : null;
  },
};

export const formatDateKey = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const memoryAPI = {
  getMemoriesForDate: async (date: Date): Promise<Memory[]> => {
    const backendAvailable = await checkMemoriesApiAvailability();
    const dateKey = formatDateKey(date);
    const userId = authAPI.getCurrentUser()?.id;
    
    if (!userId) return [];
    
    if (backendAvailable) {
      try {
        const response = await strapiClient.get('/api/memories', {
          params: {
            filters: {
              dateKey: {
                $eq: dateKey,
              },
              user: {
                id: {
                  $eq: userId,
                },
              },
            },
            populate: '*',
          },
        });
        
        return response.data.data.map((item: any) => ({
          id: item.id.toString(),
          type: item.attributes.type,
          content: item.attributes.content,
          createdAt: new Date(item.attributes.createdAt),
        }));
      } catch (error) {
        console.error('Error fetching memories from backend:', error);
       }
    }
    
    console.log('Using local storage for getMemoriesForDate');
    
    try {
      return localStorageService.getMemoriesForDate(date);
    } catch (utilsError) {
      console.error('Error using utils/storage:', utilsError);
      
      const userMemoriesKey = `yaadHaru_memories_${userId}`;
      const memories = localStorage.getItem(userMemoriesKey);
      
      if (memories) {
        const parsedMemories = JSON.parse(memories);
        const memoryArray = parsedMemories[dateKey] || [];
        
        return memoryArray.map((memory: any) => ({
          ...memory,
          createdAt: memory.createdAt instanceof Date ? memory.createdAt : new Date(memory.createdAt)
        }));
      }
    }
    
    return [];
  },
  
  saveMemoriesForDate: async (date: Date, memories: Memory[]): Promise<boolean> => {
    const backendAvailable = await checkMemoriesApiAvailability();
    const dateKey = formatDateKey(date);
    const userId = authAPI.getCurrentUser()?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    if (backendAvailable) {
      try {
        const existingResponse = await strapiClient.get('/api/memories', {
          params: {
            filters: {
              dateKey: {
                $eq: dateKey,
              },
              user: {
                id: {
                  $eq: userId,
                },
              },
            },
          },
        });
        
        const existingMemories = existingResponse.data.data || [];
        const existingIds = new Set(existingMemories.map((m: any) => m.id.toString()));
        
        for (const memory of memories) {
          const memoryData = {
            type: memory.type,
            content: memory.content,
            dateKey,
            user: userId,
          };
          
          if (memory.id && memory.id.includes('_')) {
            await strapiClient.post('/api/memories', { data: memoryData });
          } else {
            await strapiClient.put(`/api/memories/${memory.id}`, { data: memoryData });
            existingIds.delete(memory.id);
          }
        }
        
        for (const idToDelete of existingIds) {
          await strapiClient.delete(`/api/memories/${idToDelete}`);
        }
        
        return true;
      } catch (error) {
        console.error('Error saving memories to backend:', error);
       }
    }
    
     console.log('Using local storage for saveMemoriesForDate');
    
     try {
      localStorageService.saveMemoriesForDate(date, memories);
      return true;
    } catch (utilsError) {
      console.error('Error using utils/storage:', utilsError);
      
       try {
        const userMemoriesKey = `yaadHaru_memories_${userId}`;
        const userMemories = JSON.parse(localStorage.getItem(userMemoriesKey) || '{}');
        
        userMemories[dateKey] = memories;
        localStorage.setItem(userMemoriesKey, JSON.stringify(userMemories));
        
        return true;
      } catch (localError) {
        console.error('Error saving memories locally:', localError);
        return false;
      }
    }
  },
  
  getDatesWithMemoriesForMonth: async (month: Date): Promise<Set<string>> => {
    const backendAvailable = await checkMemoriesApiAvailability();
    const userId = authAPI.getCurrentUser()?.id;
    
    if (!userId) return new Set();
    
    if (backendAvailable) {
      try {
        const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
        const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        
        const startDateKey = formatDateKey(startDate);
        const endDateKey = formatDateKey(endDate);
        
        const response = await strapiClient.get('/api/memories', {
          params: {
            filters: {
              dateKey: {
                $between: [startDateKey, endDateKey],
              },
              user: {
                id: {
                  $eq: userId,
                },
              },
            },
            fields: ['dateKey'],
            pagination: {
              pageSize: 100,
            },
          },
        });
        
        const dateKeys = response.data.data.map((item: any) => item.attributes.dateKey);
        return new Set(dateKeys);
      } catch (error) {
        console.error('Error fetching dates with memories from backend:', error);
       }
    }
    
     console.log('Using local storage for getDatesWithMemoriesForMonth');
    
     try {
      return localStorageService.getDatesWithMemoriesForMonth(month);
    } catch (utilsError) {
      console.error('Error using utils/storage:', utilsError);
      
       try {
        const userMemoriesKey = `yaadHaru_memories_${userId}`;
        const memories = JSON.parse(localStorage.getItem(userMemoriesKey) || '{}');
        
        const startYear = month.getFullYear();
        const startMonth = month.getMonth();
        const monthPrefix = `${startYear}-${(startMonth + 1).toString().padStart(2, '0')}`;
        
         const dateKeys = Object.keys(memories).filter(dateKey => 
          dateKey.startsWith(monthPrefix)
        );
        
        return new Set(dateKeys);
      } catch (localError) {
        console.error('Error getting dates from local storage:', localError);
        return new Set();
      }
    }
  },
};