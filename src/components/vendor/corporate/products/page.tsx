
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
                        <TableHead>Base Price</TableHead>
                        <TableHead>MOQ</TableHead>
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
                    ) : products.length > 0 ? (
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
                                <TableCell>{product.moq || 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    <ProductActions product={product} isCorporate={true} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                No B2B enabled products found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}


export default function CorporateVendorProductsPage() {
    const [allProducts, setAllProducts] = React.useState<ProductWithStatus[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<ProductStatus | 'All' | 'B2B Enabled'>('All');

    React.useEffect(() => {
        const VENDOR_ID = 'vendor001'; 
        
        const unsubscribe = onVendorProductsUpdate(VENDOR_ID, (products) => {
            // Corporate portal only cares about B2B products (those with MOQ > 1)
            setAllProducts(products.filter(p => p.moq && p.moq > 1));
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
                    <h1 className="text-2xl font-bold">Your Products</h1>
                    <p className="text-muted-foreground">Manage your B2B product catalog and tiered pricing.</p>
                </div>
                <Button asChild>
                    <Link href="/vendor/corporate/products/new">
                        <PlusCircle className="mr-2" />
                        Add B2B Product
                    </Link>
                </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList>
                    <TabsTrigger value="All">All</TabsTrigger>
                    <TabsTrigger value="Live">Live</TabsTrigger>
                    <TabsTrigger value="Draft">Draft</TabsTrigger>
                    <TabsTrigger value="Archived">Archived</TabsTrigger>
                </TabsList>

                <ProductTable products={filteredProducts} loading={loading} />
            </Tabs>
        </div>
    );
}
