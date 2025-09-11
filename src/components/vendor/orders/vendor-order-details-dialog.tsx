
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
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
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Download, ImageIcon, FileType, File, UploadCloud } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';


interface VendorOrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  vendorName: string;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

const VENDOR_UPDATABLE_STATUSES: OrderStatus[] = ['Pending', 'Preparing', 'Packaging', 'Dispatched'];

export function VendorOrderDetailsDialog({ open, onOpenChange, order, vendorName, onStatusChange }: VendorOrderDetailsDialogProps) {
  const [selectedStatus, setSelectedStatus] = React.useState<OrderStatus | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [invoiceFile, setInvoiceFile] = React.useState<File | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (order) {
        setSelectedStatus(order.status);
    } else {
        setSelectedStatus(null);
    }
    setIsSaving(false); // Reset saving state when dialog opens or order changes
    setInvoiceFile(null); // Reset file input
  }, [order, open]);
  
  if (!order) return null;

  const vendorItems = order.items.filter(item => item.vendor === vendorName);

  const formatDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      const date = timestamp.toDate();
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
    }
    return 'N/A';
  }
  
  const handleSave = async () => {
    if (selectedStatus) {
        setIsSaving(true);
        try {
            await onStatusChange(order.id, selectedStatus);
            onOpenChange(false);
        } catch (error) {
            // Error toast is handled in the parent component
            console.error("Failed to save status from dialog", error);
        } finally {
            setIsSaving(false);
        }
    }
  }

  const handleInvoiceUpload = () => {
    if (!invoiceFile) {
        toast({ title: 'No file selected', description: 'Please choose an invoice file to upload.', variant: 'destructive' });
        return;
    }
    // Simulate upload
    setIsSaving(true);
    setTimeout(() => {
        toast({ title: 'Invoice Uploaded', description: `Successfully uploaded ${invoiceFile.name}.` });
        setInvoiceFile(null);
        setIsSaving(false);
    }, 1500);
  }

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

  const isSavable = selectedStatus !== order.status && VENDOR_UPDATABLE_STATUSES.includes(order.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details for {order.orderId}</span>
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
                                        <div className="flex items-start gap-3">
                                            <Image src={item.image} alt={item.name} width={40} height={40} className="rounded-md object-cover" />
                                            <div className="flex-grow">
                                              <p className="font-medium">{item.name}</p>
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
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button size="sm" variant="secondary"><Download className="mr-2 h-3 w-3"/>Print File</Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent>
                                                                            <DropdownMenuItem asChild>
                                                                                <a href={cust.printUrl} download>
                                                                                    <ImageIcon className="mr-2" /> Download as PNG
                                                                                </a>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem asChild>
                                                                                <a href={cust.printUrl} download>
                                                                                    <FileType className="mr-2" /> Download as SVG
                                                                                </a>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem asChild>
                                                                                 <a href={cust.printUrl} download>
                                                                                    <File className="mr-2" /> Download as PDF
                                                                                </a>
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </CardContent>
                                                </Card>
                                            )}
                                            </div>
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
                    <Select onValueChange={(value) => setSelectedStatus(value as OrderStatus)} defaultValue={selectedStatus || order.status} disabled={!VENDOR_UPDATABLE_STATUSES.includes(order.status)}>
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
                <div>
                     <h3 className="font-semibold mb-2">Upload GST Invoice</h3>
                     <div className="space-y-2">
                        <Label htmlFor="gst-invoice" className="sr-only">GST Invoice</Label>
                        <Input 
                            id="gst-invoice" 
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                            className="text-sm"
                        />
                         <Button onClick={handleInvoiceUpload} disabled={!invoiceFile || isSaving} className="w-full">
                            {isSaving && <Loader2 className="mr-2 animate-spin" />}
                            <UploadCloud className="mr-2" />
                            {invoiceFile ? `Upload ${invoiceFile.name}` : 'Upload Invoice'}
                        </Button>
                     </div>
                </div>
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!isSavable || isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
