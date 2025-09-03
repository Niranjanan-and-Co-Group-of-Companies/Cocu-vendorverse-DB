

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
import { MoreHorizontal, Edit, Trash2, Eye, Archive, UploadCloud, ArchiveRestore } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ProductWithStatus, updateProductStatus } from '@/lib/products-service';

interface ProductActionsProps {
  product: ProductWithStatus;
  isCorporate?: boolean;
  isHybrid?: boolean;
}

export function ProductActions({ product, isCorporate = false, isHybrid = false }: ProductActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (status: ProductWithStatus['status']) => {
    try {
        await updateProductStatus(product.id, status);
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
    // In a real app, this would call a delete function from the service
    // For now, we simulate it with a status change.
    handleStatusChange('Archived'); 
    setIsDeleteDialogOpen(false);
    toast({
        title: "Product Deleted",
        description: `"${product.name}" has been deleted.`,
        variant: 'destructive'
    });
  };
  
  let basePath = '/vendor/personalized';
  if (isHybrid) {
    basePath = isCorporate ? '/vendor/both/products/corporate' : '/vendor/both/products/personalized';
  } else if (isCorporate) {
    basePath = '/vendor/corporate/products';
  }

  const editPath = `${basePath}/new?id=${product.id}`;
  const livePath = isCorporate ? '/corporate/products' : '/products';

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
             <Link href={editPath}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
            </Link>
          </DropdownMenuItem>
          {product.status === 'Live' && (
            <DropdownMenuItem asChild>
                <Link href={`${livePath}/${product.id}`} target="_blank">
                    <Eye className="mr-2 h-4 w-4" />
                    View Live Page
                </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          
          {product.status === 'Draft' && (
             <DropdownMenuItem onClick={() => handleStatusChange('Pending Review')}>
                <UploadCloud className="mr-2 h-4 w-4" />
                Publish for Review
            </DropdownMenuItem>
          )}

          {product.status === 'Live' && (
             <DropdownMenuItem onClick={() => handleStatusChange('Archived')}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
            </DropdownMenuItem>
          )}

          {product.status === 'Archived' && (
             <DropdownMenuItem onClick={() => handleStatusChange('Draft')}>
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Unarchive
            </DropdownMenuItem>
          )}

          {(product.status === 'Draft' || product.status === 'Archived') && (
            <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => setIsDeleteDialogOpen(true)}
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
            </DropdownMenuItem>
          )}

        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{product.name}" from our servers.
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
