
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
import { MoreHorizontal, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Promotion } from '@/lib/promotions-service';
import { updatePromotionStatus, deletePromotion } from '@/lib/promotions-service';

interface PromotionActionsProps {
  promotion: Promotion;
  onEdit: () => void;
}

export function PromotionActions({ promotion, onEdit }: PromotionActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleStatusToggle = async () => {
    const newStatus = promotion.status === 'Active' ? 'Inactive' : 'Active';
    try {
        await updatePromotionStatus(promotion.id, newStatus);
        toast({ title: 'Status Updated', description: `Promotion is now ${newStatus}.` });
    } catch(error) {
        toast({ title: 'Error', description: 'Could not update status.', variant: 'destructive' });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
        await deletePromotion(promotion.id);
        toast({ title: 'Promotion Deleted', description: 'The promotion has been permanently removed.', variant: 'destructive' });
    } catch (error) {
         toast({ title: 'Error', description: 'Could not delete promotion.', variant: 'destructive' });
    }
    setIsDeleteDialogOpen(false);
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
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleStatusToggle}>
            {promotion.status === 'Active' ? (
                <><PowerOff className="mr-2 h-4 w-4" /> Deactivate</>
            ) : (
                <><Power className="mr-2 h-4 w-4" /> Activate</>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the coupon code "{promotion.code}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={handleDeleteConfirm}>
                Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
