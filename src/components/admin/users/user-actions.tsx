

'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, User, ShoppingCart, ShieldOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User as UserType } from '@/lib/user-service';

interface UserActionsProps {
  user: UserType;
  onStatusChange: (userId: string, status: 'Active' | 'Suspended') => void;
  onViewProfile: () => void;
  onViewOrders: () => void;
}

export function UserActions({ user, onStatusChange, onViewProfile, onViewOrders }: UserActionsProps) {
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleSuspend = () => {
    onStatusChange(user.id, 'Suspended');
    setIsSuspendDialogOpen(false);
    toast({
        title: "User Account Suspended",
        description: `The account for ${user.name} has been suspended.`,
        variant: 'destructive'
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={onViewProfile}>
             <User className="mr-2 h-4 w-4" />
             View Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onViewOrders}>
             <ShoppingCart className="mr-2 h-4 w-4" />
             View Orders
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
            onClick={() => setIsSuspendDialogOpen(true)}
            disabled={user.status === 'Suspended'}
          >
            <ShieldOff className="mr-2 h-4 w-4" />
            Suspend
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to suspend this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disable their account, preventing them from making purchases or logging in. This action can be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={handleSuspend}
            >
                Confirm Suspension
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
