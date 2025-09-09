
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
import { MoreHorizontal, Store, Package, CreditCard, ShieldOff, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { Vendor } from '@/lib/vendors-service';

interface VendorActionsProps {
  vendor: Vendor;
  onStatusChange: (vendorId: string, status: 'Active' | 'Pending' | 'Suspended') => void;
  onEdit: (vendor: Vendor) => void;
}

export function VendorActions({ vendor, onStatusChange, onEdit }: VendorActionsProps) {
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleSuspend = () => {
    onStatusChange(vendor.id, 'Suspended');
    setIsSuspendDialogOpen(false);
    toast({
        title: "Vendor Suspended",
        description: `${vendor.name} has been suspended.`,
        variant: 'destructive'
    });
  };
  
  const handleApprove = () => {
    onStatusChange(vendor.id, 'Active');
    toast({
        title: "Vendor Approved",
        description: `${vendor.name} is now active and can start selling.`,
    });
  }

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
          <DropdownMenuItem onClick={() => onEdit(vendor)}>
             <Store className="mr-2 h-4 w-4" />
             Edit Details
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
             <Link href={`/admin/products?vendorId=${vendor.id}`}>
                <Package className="mr-2 h-4 w-4" />
                View Products
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
             <Link href="#">
                <CreditCard className="mr-2 h-4 w-4" />
                View Payouts
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
           {vendor.status === 'Pending' && (
             <DropdownMenuItem onClick={handleApprove}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Approve Vendor
            </DropdownMenuItem>
           )}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
            onClick={() => setIsSuspendDialogOpen(true)}
            disabled={vendor.status === 'Suspended'}
          >
            <ShieldOff className="mr-2 h-4 w-4" />
            Suspend
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to suspend this vendor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disable their account, preventing them from selling products and accessing the vendor portal. This action can be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={handleSuspend}
            >
                Confirm Suspension
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
