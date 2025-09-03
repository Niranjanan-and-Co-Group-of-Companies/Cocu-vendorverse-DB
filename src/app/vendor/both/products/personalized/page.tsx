

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
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { onVendorProductsUpdate, type ProductWithStatus, ProductStatus } from '@/lib/products-service';
import Link from 'next/link';
import { ProductActions } from '@/components/vendor/products/product-actions';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

function ProductTable({ products, loading }: { products: ProductWithStatus[], loading: boolean }) {
    
    const getStatusVariant = (status: ProductStatus) => {
        switch (status) {
            case 'Live': return 'default';
            case 'Pending Review': return 'secondary';
            case 'Draft': return 'secondary';
            case 'Archived': return 'outline';
            case 'Declined': return 'destructive';
        }
    };
    
    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm mt-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Inventory</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : (
                        products.map((product) => (
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
                                <TableCell>
                                    <Badge variant={getStatusVariant(product.status)}>{product.status}</Badge>
                                </TableCell>
                                <TableCell>{product.price}</TableCell>
                                <TableCell>{product.stock}</TableCell>
                                <TableCell className="text-right">
                                    <ProductActions product={product} isHybrid={true} />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}


export default function VendorProductsPage() {
    const [allProducts, setAllProducts] = React.useState<ProductWithStatus[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<ProductStatus | 'All'>('All');

    React.useEffect(() => {
        // In a real app, you would get the vendor's ID from an authentication context.
        const VENDOR_ID = 'vendor001'; 
        
        const unsubscribe = onVendorProductsUpdate(VENDOR_ID, (products) => {
            const retailProducts = products.filter(p => !p.moq || p.moq <= 1);
            setAllProducts(retailProducts);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    const filteredProducts = React.useMemo(() => {
        if (activeTab === 'All') return allProducts;
        return allProducts.filter(p => p.status === activeTab);
    }, [allProducts, activeTab]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Your Personalized Products</h1>
                    <p className="text-muted-foreground">Manage your B2C product catalog.</p>
                </div>
                <Button asChild>
                    <Link href="/vendor/both/products/personalized/new">
                        <PlusCircle className="mr-2" />
                        Add Product
                    </Link>
                </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList>
                    <TabsTrigger value="All">All</TabsTrigger>
                    <TabsTrigger value="Live">Live</TabsTrigger>
                    <TabsTrigger value="Draft">Draft</TabsTrigger>
                    <TabsTrigger value="Pending Review">Pending Review</TabsTrigger>
                    <TabsTrigger value="Archived">Archived</TabsTrigger>
                </TabsList>

                <ProductTable products={filteredProducts} loading={loading} />
            </Tabs>
        </div>
    );
}
