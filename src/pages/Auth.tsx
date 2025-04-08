
import React, { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="text-center mb-8">
      <h1 className="mb-8 text-4xl font-bold">
        <span className="text-white">Yaad</span>
        <span className="text-purple-500">Haru</span>
      </h1>
        <p className="text-muted-foreground text-lg">Your Memory Journal</p>
      </div>

      <div 
        key={isLogin ? "login" : "register"}
        className="w-full max-w-md transition-all duration-300 ease-in-out"
      >
        {isLogin ? (
          <LoginForm onRegisterClick={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onLoginClick={() => setIsLogin(true)} />
        )}
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} YaadHaru. All rights reserved.</p>
      </div>
    </div>
  );
}
