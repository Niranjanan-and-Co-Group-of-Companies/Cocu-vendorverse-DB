
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Order, OrderItem, OrderStatus } from '@/lib/orders-service';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface VendorOrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  vendorName: string;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

const VENDOR_UPDATABLE_STATUSES: OrderStatus[] = ['Pending', 'Preparing', 'Packaging', 'Dispatched'];

export function VendorOrderDetailsDialog({ open, onOpenChange, order, vendorName, onStatusChange }: VendorOrderDetailsDialogProps) {
  
  if (!order) return null;

  const vendorItems = order.items.filter(item => item.vendor === vendorName);

  const formatDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      const date = timestamp.toDate();
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
    }
    return 'N/A';
  }
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    onStatusChange(order.id, newStatus);
  };

  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
        case 'Delivered':
        case 'Shipped': return 'default';
        case 'Preparing':
        case 'Packaging':
        case 'Dispatched': return 'secondary';
        case 'Pending': return 'secondary';
        case 'Cancelled': return 'destructive';
        default: return 'outline';
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details for #{order.id.slice(0,8)}...</span>
            <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
          </DialogTitle>
          <DialogDescription>
             Placed on: {formatDate(order.date)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 md:grid-cols-2">
            <div>
                <h3 className="font-semibold mb-2">Items to Fulfill</h3>
                 <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Qty</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vendorItems.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Image src={item.image} alt={item.name} width={40} height={40} className="rounded-md object-cover" />
                                            <p className="font-medium">{item.name}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">x{item.quantity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            
            <div className="space-y-6">
                 <div>
                    <h3 className="font-semibold mb-2">Update Order Status</h3>
                    <Select onValueChange={handleStatusUpdate} defaultValue={order.status} disabled={!VENDOR_UPDATABLE_STATUSES.includes(order.status)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                            {VENDOR_UPDATABLE_STATUSES.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     {!VENDOR_UPDATABLE_STATUSES.includes(order.status) && (
                        <p className="text-xs text-muted-foreground mt-2">
                            This order's status is managed automatically after dispatch.
                        </p>
                    )}
                 </div>
                 <div>
                    <h3 className="font-semibold mb-2">Customer Shipping Address</h3>
                    <address className="not-italic text-sm text-muted-foreground border p-3 rounded-md">
                        {order.customer.shippingAddress.split(', ').map(line => <span key={line} className="block">{line}</span>)}
                    </address>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
