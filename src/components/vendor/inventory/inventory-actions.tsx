
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
import { MoreHorizontal, Edit, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/lib/products';

interface InventoryActionsProps {
  product: Product;
  isEditing: boolean;
  isSaving: boolean;
  onSave: () => void;
  isHybrid?: boolean;
  isCorporate?: boolean;
}

export function InventoryActions({ product, isEditing, isSaving, onSave, isHybrid = false, isCorporate = false }: InventoryActionsProps) {

  if (isEditing) {
    return (
        <Button size="sm" onClick={onSave} disabled={isSaving}>
            {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save'}
        </Button>
    )
  }
  
  const editPath = isHybrid
    ? `/vendor/both/products/${isCorporate ? 'corporate' : 'personalized'}/new?id=${product.id}`
    : `/vendor/personalized/products/new?id=${product.id}`;

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
          <Link href={editPath}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Product
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
