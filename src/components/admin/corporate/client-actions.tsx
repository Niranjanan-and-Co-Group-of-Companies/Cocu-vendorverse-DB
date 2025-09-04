
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
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, ShoppingCart, Gavel } from 'lucide-react';
import Link from 'next/link';

export function ClientActions() {
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
           <Link href="#"><ShoppingCart className="mr-2 h-4 w-4" /> View Orders</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
            <Link href="#"><Gavel className="mr-2 h-4 w-4" /> View Bids</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
            <Link href="#"><Edit className="mr-2 h-4 w-4" /> Edit Client</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Client
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
