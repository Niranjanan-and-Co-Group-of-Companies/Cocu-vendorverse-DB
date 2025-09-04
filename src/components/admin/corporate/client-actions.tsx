
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
import { MoreHorizontal, Edit, Trash2, ShoppingCart, Gavel } from 'lucide-react';
import Link from 'next/link';
import type { CorporateClient } from '@/lib/corporate-clients-service';
import { deleteCorporateClient } from '@/lib/corporate-clients-service';
import { useToast } from '@/hooks/use-toast';

interface ClientActionsProps {
    client: CorporateClient;
    onEdit: () => void;
}

export function ClientActions({ client, onEdit }: ClientActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteCorporateClient(client.id);
      toast({ title: "Client Deleted", description: `${client.name} has been removed.`, variant: "destructive" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete client.", variant: "destructive" });
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
        <DropdownMenuItem asChild>
           <Link href={`/admin/orders?customerId=${client.id}`}><ShoppingCart className="mr-2 h-4 w-4" /> View Orders</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
            <Link href={`/admin/bids?customerId=${client.id}`}><Gavel className="mr-2 h-4 w-4" /> View Bids</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" /> Edit Client
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete Client
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client "{client.name}" and all associated data.
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
