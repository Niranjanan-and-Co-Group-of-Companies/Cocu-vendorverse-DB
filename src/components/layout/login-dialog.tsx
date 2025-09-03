
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  // In a real app, these handlers would call an authentication service
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in...');
    onOpenChange(false);
  };
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Signing up...');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to VendorVerse</DialogTitle>
          <DialogDescription>
            Log in or create an account to continue.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <form className="grid gap-4 py-4" onSubmit={handleLogin}>
                    <div className="grid gap-2">
                        <Label htmlFor="email-login">Email</Label>
                        <Input id="email-login" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password-login">Password</Label>
                        <Input id="password-login" type="password" required />
                    </div>
                    <Button type="submit" className="w-full">Login</Button>
                    <Button variant="outline" className="w-full">Login with Google</Button>
                </form>
            </TabsContent>
             <TabsContent value="signup">
                <form className="grid gap-4 py-4" onSubmit={handleSignup}>
                    <div className="grid gap-2">
                        <Label htmlFor="name-signup">Name</Label>
                        <Input id="name-signup" placeholder="John Doe" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email-signup">Email</Label>
                        <Input id="email-signup" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password-signup">Password</Label>
                        <Input id="password-signup" type="password" required />
                    </div>
                    <Button type="submit" className="w-full">Create Account</Button>
                </form>
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
