
import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name: string;
} | null;

type AuthContextType = {
  user: User;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("yaadHaru_currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = JSON.parse(localStorage.getItem("yaadHaru_users") || "[]");
    const user = users.find((u: any) => u.email === email);
    
    if (user && user.password === password) {
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
      };
      localStorage.setItem("yaadHaru_currentUser", JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    
    return false;
  };

  const register = async (name: string, email: string, password: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = JSON.parse(localStorage.getItem("yaadHaru_users") || "[]");
    const userExists = users.some((u: any) => u.email === email);
    
    if (userExists) {
      return false;
    }
    
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem("yaadHaru_users", JSON.stringify(users));
    
    return true;
  };

  const logout = () => {
    localStorage.removeItem("yaadHaru_currentUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
