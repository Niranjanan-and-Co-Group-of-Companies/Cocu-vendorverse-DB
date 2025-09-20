
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
} from '@/components/ui/card';
import type { Order, CustomizationDetails } from '@/lib/orders-service';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { CustomizationProofDialog } from '@/components/orders/customization-proof-dialog';

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export function OrderDetailsDialog({ open, onOpenChange, order }: OrderDetailsDialogProps) {
  const [proofingItem, setProofingItem] = React.useState<{ name: string; customizations: CustomizationDetails[] } | null>(null);

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
    <>
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
                <span>Order Details</span>
                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
            </DialogTitle>
            <div className="text-sm text-muted-foreground">
                <p>Order ID: <span className="font-mono">{order.orderId}</span></p>
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
                                                <div className="flex items-start gap-3">
                                                    <Image src={item.selectedVariant?.image || item.image} alt={item.name} width={40} height={40} className="rounded-md object-cover" />
                                                    <div className="flex-grow">
                                                        <p className="font-medium">{item.name}</p>
                                                        {item.selectedVariant && <p className="text-xs text-muted-foreground">{item.selectedVariant.colorName}</p>}
                                                        <div className="text-xs text-muted-foreground">
                                                            <span>{formatCurrency(parseFloat(item.price.replace('₹', '').replace('$', '')))}</span>
                                                        </div>
                                                        {item.customizations && item.customizations.length > 0 && (
                                                            <div className="mt-2 flex gap-2">
                                                                <Button size="sm" variant="outline" onClick={() => setProofingItem({ name: item.name, customizations: item.customizations! })}>
                                                                    <FileText className="mr-2 h-3 w-3"/>View Proof
                                                                </Button>
                                                                <a href={item.customizations[0].printUrl} download={`${order.orderId}_${item.name}_print.png`}>
                                                                    <Button size="sm" variant="secondary"><Download className="mr-2 h-3 w-3"/>Download PNG</Button>
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
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
        <CustomizationProofDialog 
            item={proofingItem} 
            isOpen={!!proofingItem}
            onOpenChange={() => setProofingItem(null)}
        />
    </>
  );
}
