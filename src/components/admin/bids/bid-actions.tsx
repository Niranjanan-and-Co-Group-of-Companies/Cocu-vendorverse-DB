
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
import { MoreHorizontal, FileText } from 'lucide-react';
import type { Bid } from '@/lib/bids-service';

interface BidActionsProps {
  bid: Bid;
  onViewDetails: () => void;
}

export function BidActions({ bid, onViewDetails }: BidActionsProps) {
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
        <DropdownMenuItem onClick={onViewDetails}>
           <FileText className="mr-2 h-4 w-4" />
           View Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
