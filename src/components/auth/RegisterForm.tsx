
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Lock, Mail, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onLoginClick: () => void;
}

export default function RegisterForm({ onLoginClick }: RegisterFormProps) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem("yaadHaru_users") || "[]");
    const userExists = users.some((user: any) => user.email === data.email);

    if (userExists) {
      toast.error("User already exists with this email");
      return;
    }

    // Add new user
    const newUser = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password, // In a real app, you should hash this password
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("yaadHaru_users", JSON.stringify(users));
    
    toast.success("Registration successful! Please login.");
    onLoginClick();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>Sign up to start saving your memories</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                      <div className="px-3 py-2 text-muted-foreground">
                        <User className="h-5 w-5" />
                      </div>
                      <Input placeholder="Your name" className="border-0 focus-visible:ring-0" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                      <div className="px-3 py-2 text-muted-foreground">
                        <Mail className="h-5 w-5" />
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
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="border-0 focus-visible:ring-0" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                      <div className="px-3 py-2 text-muted-foreground">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="border-0 focus-visible:ring-0" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Register</Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Button variant="link" className="p-0" onClick={onLoginClick}>
            Sign in
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
