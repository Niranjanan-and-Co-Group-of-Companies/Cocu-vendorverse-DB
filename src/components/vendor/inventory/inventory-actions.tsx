
'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Save } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/lib/products';

interface InventoryActionsProps {
  product: Product;
  isEditing: boolean;
  onSave: () => void;
}

export function InventoryActions({ product, isEditing, onSave }: InventoryActionsProps) {

  if (isEditing) {
    return (
        <Button size="sm" onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
        </Button>
    )
  }
  
  return (
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
          <Link href={`/vendor/personalized/products/new?id=${product.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Product
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
