
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
import { MoreHorizontal, Edit, Trash2, Eye, Archive, UploadCloud, ArchiveRestore, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ProductWithStatus, updateProductStatus } from '@/lib/products-service';

interface AdminProductActionsProps {
  product: ProductWithStatus;
}

export function AdminProductActions({ product }: AdminProductActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (status: ProductWithStatus['status']) => {
    try {
        await updateProductStatus(String(product.id), status);
        toast({
            title: "Product Status Updated",
            description: `"${product.name}" has been updated to ${status}.`
        });
    } catch(error) {
        console.error("Failed to update product status: ", error);
        toast({
            title: "Error",
            description: "Failed to update product status.",
            variant: "destructive"
        });
    }
  };

  const handleDelete = () => {
    // In a real app, this would be a hard delete. For now, we archive.
    handleStatusChange('Archived'); 
    setIsDeleteDialogOpen(false);
    toast({
        title: "Product Deleted",
        description: `"${product.name}" has been deleted.`,
        variant: 'destructive'
    });
  };
  
  const isB2B = product.moq && product.moq > 1;
  const livePath = isB2B ? `/corporate/products/${product.id}` : `/products/${product.id}`;

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
             <Link href={`/admin/products/new?id=${product.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
             <Link href={livePath} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                View Live Page
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          
          {product.status === 'Live' ? (
             <DropdownMenuItem onClick={() => handleStatusChange('Draft')}>
                <EyeOff className="mr-2 h-4 w-4" />
                Unpublish (Set to Draft)
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleStatusChange('Live')}>
                <UploadCloud className="mr-2 h-4 w-4" />
                Publish
            </DropdownMenuItem>
          )}

          {product.status !== 'Archived' && (
             <DropdownMenuItem onClick={() => handleStatusChange('Archived')}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
            </DropdownMenuItem>
          )}

          {product.status === 'Archived' && (
             <DropdownMenuItem onClick={() => handleStatusChange('Draft')}>
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Restore (to Draft)
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{product.name}" and all associated data.
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
