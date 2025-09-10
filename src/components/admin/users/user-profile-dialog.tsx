
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { User } from '@/lib/user-service';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface UserProfileDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({ user, open, onOpenChange }: UserProfileDialogProps) {
  if (!user) return null;

  const formatDate = (timestamp: any) => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return 'N/A';
  };

  const getStatusVariant = (status: User['status']) => {
    return status === 'Active' ? 'default' : 'destructive';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{user.name}</DialogTitle>
              <DialogDescription>{user.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4 grid grid-cols-2 gap-x-4 gap-y-6">
            <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <p><Badge variant={getStatusVariant(user.status)}>{user.status}</Badge></p>
            </div>
            <div>
                <Label className="text-sm text-muted-foreground">Role</Label>
                <p className="capitalize">{user.role}</p>
            </div>
            <div>
                <Label className="text-sm text-muted-foreground">User ID</Label>
                <p className="text-xs font-mono">{user.id}</p>
            </div>
            <div>
                <Label className="text-sm text-muted-foreground">Joined Date</Label>
                <p>{formatDate(user.joinedDate)}</p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
