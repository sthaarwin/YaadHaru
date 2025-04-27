import axios from 'axios';

const API_URL = import.meta.env.VITE_STRAPI_API_URL;

// Create flags to track backend availability
let isBackendAvailable = false;
let isMemoriesApiAvailable = false;
let checkingBackend = false;

// Function to check if backend is available
export const checkBackendAvailability = async (): Promise<boolean> => {
  if (checkingBackend) return isBackendAvailable;
  
  checkingBackend = true;
  
  try {
    // Use a lightweight call to an endpoint that should exist in all Strapi instances
    await axios.get(`${API_URL}`, { 
      timeout: 2000 // Short timeout
    });
    
    isBackendAvailable = true;
    console.log('Backend is available');
  } catch (error) {
    isBackendAvailable = false;
    console.log('Backend is not available, using local storage');
  } finally {
    checkingBackend = false;
  }
  
  return isBackendAvailable;
};

// Function to check specifically if memories API is available
export const checkMemoriesApiAvailability = async (): Promise<boolean> => {
  if (!isBackendAvailable) return false;
  
  try {
    // Make a lightweight call to check if the memories endpoint exists
    await axios.get(`${API_URL}/api/memories?pagination[pageSize]=1`, { 
      timeout: 2000 // Short timeout
    });
    
    isMemoriesApiAvailable = true;
    console.log('Memories API is available');
  } catch (error) {
    isMemoriesApiAvailable = false;
    console.log('Memories API is not available, using local storage for memories');
  }
  
  return isMemoriesApiAvailable;
};

// Check backend availability on startup
checkBackendAvailability().then(() => {
  if (isBackendAvailable) {
    checkMemoriesApiAvailability();
  }
});

// Periodically check backend availability
setInterval(async () => {
  const backendAvailable = await checkBackendAvailability();
  if (backendAvailable) {
    checkMemoriesApiAvailability();
  }
}, 30000); // Check every 30 seconds

const strapiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

strapiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('yaadHaru_jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default strapiClient;