
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
import { MoreHorizontal, Edit, Trash2, Copy } from 'lucide-react';
import type { Promotion } from '@/lib/promotions-service';
import { useToast } from '@/hooks/use-toast';
import { deletePromotion } from '@/lib/promotions-service';

interface PromotionActionsProps {
    promotion: Promotion;
    onEdit: () => void;
}

export function PromotionActions({ promotion, onEdit }: PromotionActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deletePromotion(promotion.id);
      toast({ title: "Promotion Deleted", description: `Coupon "${promotion.code}" has been deleted.`, variant: "destructive" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete promotion.", variant: "destructive" });
    }
    setIsDeleteDialogOpen(false);
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(promotion.code);
    toast({ title: "Copied to clipboard!", description: `Coupon code "${promotion.code}" has been copied.` });
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
         <DropdownMenuItem onClick={handleCopyCode}>
           <Copy className="mr-2 h-4 w-4" /> Copy Code
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the promotion "{promotion.code}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={handleDelete}
            >
                Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

