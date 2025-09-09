

'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
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
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, ProductStatus } from '@/lib/products';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminProductActions } from '@/components/admin/products/product-actions';


type ProductWithStatus = Product & { status: ProductStatus };
type ProductView = 'all' | 'personal' | 'corporate';

function ProductsTable() {
    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get('category');
    const [allProducts, setAllProducts] = React.useState<ProductWithStatus[]>([]);
    const [filteredProducts, setFilteredProducts] = React.useState<ProductWithStatus[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [title, setTitle] = React.useState('All Products');
    const [view, setView] = React.useState<ProductView>('all');

    React.useEffect(() => {
        setLoading(true);

        const productsRef = collection(db, 'products');
        let q;

        if (categoryFilter) {
            setTitle(`Products in: ${categoryFilter}`);
            q = query(productsRef, where('category', '==', categoryFilter));
        } else {
            setTitle('All Products');
            q = query(productsRef);
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const productsData = snapshot.docs.map(doc => doc.data() as ProductWithStatus);
            setAllProducts(productsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching products: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [categoryFilter]);

    React.useEffect(() => {
        let productsToFilter = [...allProducts];
        if (view === 'personal') {
            productsToFilter = productsToFilter.filter(p => p.platform === 'Personalized' || p.platform === 'Both');
            setTitle('Personalized Retail Products');
        } else if (view === 'corporate') {
            productsToFilter = productsToFilter.filter(p => p.platform === 'Corporate' || p.platform === 'Both');
            setTitle('Corporate & Bulk Products');
        } else {
            setTitle('All Products');
        }
        setFilteredProducts(productsToFilter);
    }, [view, allProducts]);

    const getStatusVariant = (status: ProductStatus) => {
        switch (status) {
            case 'Live':
                return 'default';
            case 'Pending Review':
                return 'secondary';
            case 'Draft':
                return 'secondary';
            case 'Declined':
                return 'destructive';
            default:
                return 'outline';
        }
    };
    
    const isCorporateView = view === 'corporate';
    
    const formatCurrency = (value: string | number) => {
        const numValue = typeof value === 'string' ? parseFloat(value.replace('$', '').replace('₹', '')) : value;
        if(isNaN(numValue)) return value;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(numValue);
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <p className="text-muted-foreground">
                        {filteredProducts.length} products found. Manage all products from all vendors in the marketplace.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Tabs value={view} onValueChange={(value) => setView(value as ProductView)}>
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="personal">Personalized</TabsTrigger>
                            <TabsTrigger value="corporate">Corporate</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button asChild>
                        <Link href="/admin/products/new">
                            <PlusCircle className="mr-2" />
                            Add Product
                        </Link>
                    </Button>
                </div>
            </div>
             <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    {isCorporateView && <TableHead>MOQ</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={i}>
                        <TableCell><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        {isCorporateView && <TableCell><Skeleton className="h-5 w-12" /></TableCell>}
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                    ) : (
                    filteredProducts.map((product) => {
                        const isB2B = product.moq && product.moq > 1;
                        return (
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
                            <Badge variant={getStatusVariant(product.status)}>
                            {product.status}
                            </Badge>
                        </TableCell>
                         <TableCell>{product.vendor}</TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>
                           <Badge variant={isB2B ? 'secondary' : 'outline'}>
                                {isB2B ? 'Corporate' : 'Personal'}
                           </Badge>
                        </TableCell>
                        {isCorporateView && <TableCell>{product.moq}</TableCell>}
                        <TableCell className="text-right">
                           <AdminProductActions product={product} />
                        </TableCell>
                        </TableRow>
                    )})
                    )}
                </TableBody>
                </Table>
             </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <ProductsTable />
        </React.Suspense>
    );
}
