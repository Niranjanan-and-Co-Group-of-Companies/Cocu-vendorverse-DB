
'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FileText, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/orders-service';

interface OrderActionsProps {
  order: Order;
  onViewDetails: () => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

export function OrderActions({ order, onViewDetails, onStatusChange }: OrderActionsProps) {

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    onStatusChange(order.id, newStatus);
  };

  const availableStatuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

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
          <DropdownMenuItem onClick={onViewDetails}>
             <FileText className="mr-2 h-4 w-4" />
             View Details
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Package className="mr-2 h-4 w-4" />
                Mark as...
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                     {availableStatuses.map(status => (
                        <DropdownMenuItem 
                            key={status} 
                            onClick={() => handleStatusUpdate(status)}
                            disabled={order.status === status}
                        >
                            {status === 'Pending' && <Package className="mr-2 h-4 w-4" />}
                            {status === 'Processing' && <Package className="mr-2 h-4 w-4" />}
                            {status === 'Shipped' && <Truck className="mr-2 h-4 w-4" />}
                            {status === 'Delivered' && <CheckCircle className="mr-2 h-4 w-4" />}
                            {status === 'Cancelled' && <XCircle className="mr-2 h-4 w-4 text-destructive" />}
                            <span>{status}</span>
                        </DropdownMenuItem>
                     ))}
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

    