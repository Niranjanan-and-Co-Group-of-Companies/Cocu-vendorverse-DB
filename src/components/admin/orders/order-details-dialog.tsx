

'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import type { Order } from '@/lib/orders-service';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export function OrderDetailsDialog({ open, onOpenChange, order }: OrderDetailsDialogProps) {
  
  if (!order) return null;

  const formatDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      const date = timestamp.toDate();
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
    }
    return 'N/A';
  }
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
        case 'Delivered': return 'default';
        case 'Shipped': return 'default';
        case 'Processing': return 'secondary';
        case 'Pending': return 'secondary';
        case 'Cancelled': return 'destructive';
        default: return 'outline';
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details</span>
            <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
             <p>Order ID: <span className="font-mono">{order.id}</span></p>
             <p>Placed on: {formatDate(order.date)}</p>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4 md:grid-cols-2">
            <div>
                <h3 className="font-semibold mb-2">Items Ordered</h3>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Image src={item.image} alt={item.name} width={40} height={40} className="rounded-md object-cover" />
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    <div className="text-xs text-muted-foreground">
                                                        <span>{formatCurrency(parseFloat(item.price.replace('₹', '').replace('$', '')))}</span>
                                                    </div>
                                                </div>
                                            </div>
                                             {item.customizations && item.customizations.length > 0 && (
                                                <Card className="mt-2">
                                                    <CardHeader className="p-2">
                                                        <CardTitle className="text-xs">Customizations</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-2 text-xs space-y-2">
                                                        {item.customizations.map((cust, i) => (
                                                            <div key={i} className="flex items-center justify-between">
                                                                <span className="capitalize">{cust.side} Side</span>
                                                                <div className="flex gap-2">
                                                                     <a href={cust.proofUrl} target="_blank" rel="noopener noreferrer">
                                                                        <Button size="sm" variant="outline"><FileText className="mr-2 h-3 w-3"/>Proof</Button>
                                                                    </a>
                                                                    <a href={cust.printUrl} target="_blank" rel="noopener noreferrer">
                                                                        <Button size="sm" variant="secondary"><Download className="mr-2 h-3 w-3"/>Print File</Button>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </TableCell>
                                        <TableCell>x{item.quantity}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(parseFloat(item.price.replace('₹', '').replace('$', '')) * item.quantity)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                 <div className="mt-4 text-right">
                    <p>Subtotal: <span className="font-medium">{formatCurrency(order.subtotal)}</span></p>
                    <p>Shipping: <span className="font-medium">{formatCurrency(order.shipping)}</span></p>
                    <p className="font-bold text-lg">Total: <span className="font-bold">{formatCurrency(order.total)}</span></p>
                </div>
            </div>
            
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Shipping Address:</span><br/>
                            {order.customer.shippingAddress.split(', ').map(line => <span key={line} className="block">{line}</span>)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Information</CardTitle>
                    </CardHeader>
                     <CardContent>
                        <p>Method: <span className="font-medium">{order.payment.method}</span></p>
                        <p>Transaction ID: <span className="font-mono text-xs">{order.payment.transactionId}</span></p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
