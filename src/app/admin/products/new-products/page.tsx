
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Check, X, MessageSquare, PackageSearch } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { onPendingProductsUpdate, approveProduct, declineProduct, type ProductWithVendor } from '@/lib/products-service';
import { useToast } from '@/hooks/use-toast';
import { VendorContactDialog } from '@/components/admin/products/vendor-contact-dialog';

export default function NewProductsPage() {
    const [pendingProducts, setPendingProducts] = React.useState<ProductWithVendor[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { toast } = useToast();
    const [contactingVendor, setContactingVendor] = React.useState<ProductWithVendor['vendor'] | null>(null);

    React.useEffect(() => {
        const unsubscribe = onPendingProductsUpdate((products) => {
            setPendingProducts(products);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleApprove = async (productId: number) => {
        await approveProduct(productId);
        toast({ title: 'Product Approved', description: 'The product is now live on the marketplace.' });
    };

    const handleDecline = async (productId: number) => {
        await declineProduct(productId);
        toast({ title: 'Product Declined', description: 'The product has been returned to the vendor as a draft.', variant: 'destructive' });
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold">New Product Submissions</h1>
                <p className="text-muted-foreground">Review and approve new products submitted by vendors.</p>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-9 w-40 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : pendingProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center">
                                    <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <p className="mt-4 text-muted-foreground">No pending products for review.</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            pendingProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            width={64}
                                            height={64}
                                            className="rounded-md object-cover"
                                            data-ai-hint="product image"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.vendor.name}</TableCell>
                                    <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                                    <TableCell>{product.price}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button size="sm" onClick={() => handleApprove(product.id)}>
                                                <Check className="mr-2" /> Approve
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDecline(product.id)}>
                                                <X className="mr-2" /> Decline
                                            </Button>
                                            <Button size="sm" variant="secondary" onClick={() => setContactingVendor(product.vendor)}>
                                                <MessageSquare className="mr-2" /> Contact
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <VendorContactDialog 
                vendor={contactingVendor}
                open={!!contactingVendor}
                onOpenChange={(isOpen) => !isOpen && setContactingVendor(null)}
            />
        </div>
    );
}
