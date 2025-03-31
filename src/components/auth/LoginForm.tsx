
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Lock, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onRegisterClick: () => void;
}

export default function LoginForm({ onRegisterClick }: LoginFormProps) {
  const navigate = useNavigate();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem("yaadHaru_users") || "[]");
    const user = users.find((u: any) => u.email === data.email);

    if (!user) {
      toast.error("User not found. Please register first.");
      return;
    }

    if (user.password !== data.password) {
      toast.error("Incorrect password. Please try again.");
      return;
    }

    // Set user as logged in
    localStorage.setItem("yaadHaru_currentUser", JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
    }));

    toast.success("Login successful!");
    navigate("/dashboard");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>Sign in to access your memories</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                      <div className="px-3 py-2 text-muted-foreground">
                        <User className="h-5 w-5" />
                      </div>
                      <Input placeholder="you@example.com" className="border-0 focus-visible:ring-0" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                      <div className="px-3 py-2 text-muted-foreground">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Input type="password" placeholder="••••••••" className="border-0 focus-visible:ring-0" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="text-sm text-muted-foreground text-center">
          Don't have an account?{" "}
          <Button variant="link" className="p-0" onClick={onRegisterClick}>
            Register
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
