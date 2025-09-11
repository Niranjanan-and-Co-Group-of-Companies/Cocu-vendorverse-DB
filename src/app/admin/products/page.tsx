

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
import { PlusCircle, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product, ProductStatus } from '@/lib/products';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminProductActions } from '@/components/admin/products/product-actions';
import { calculateAdminDisplayPrice } from '@/lib/admin/admin-pricing-service';
import { onCategoriesUpdate } from '@/lib/categories-service';
import type { Category } from '@/lib/categories-service';
import { onSnapshot, query, collection, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';


type ProductWithPrice = Product & { displayPrice?: number };
type ProductView = 'all' | 'personal' | 'corporate';

function ProductsPageContent() {
    const searchParams = useSearchParams();
    const categorySlugFilter = searchParams.get('category');
    const vendorIdFilter = searchParams.get('vendorId');
    
    const [rawProducts, setRawProducts] = React.useState<Product[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [allProducts, setAllProducts] = React.useState<ProductWithPrice[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [title, setTitle] = React.useState('All Products');
    const [view, setView] = React.useState<ProductView>('all');
    const [searchQuery, setSearchQuery] = React.useState('');

    // Effect to fetch product and category updates
    React.useEffect(() => {
        setLoading(true);

        const productsRef = collection(db, 'products');
        let q = query(productsRef);

        if (categorySlugFilter) {
            q = query(q, where('categorySlug', '==', categorySlugFilter));
            setTitle(`Products in: ${categorySlugFilter.replace(/-/g, ' ')}`);
        } else if (vendorIdFilter) {
            q = query(q, where('vendorId', '==', vendorIdFilter));
            // Fetch vendor name to update title
            getDoc(doc(db, 'vendors', vendorIdFilter)).then(docSnap => {
                if (docSnap.exists()) {
                    setTitle(`Products by: ${docSnap.data().name}`);
                }
            });
        } else {
            setTitle('All Products');
        }

        const unsubProducts = onSnapshot(q, (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({...doc.data(), id: doc.id} as Product));
            setRawProducts(productsData);
        });

        const unsubCategories = onCategoriesUpdate((cats) => {
            setCategories(cats);
        });

        return () => {
            unsubProducts();
            unsubCategories();
        };
    }, [categorySlugFilter, vendorIdFilter]);
    
    // Effect to recalculate prices when products or categories change
    React.useEffect(() => {
        const calculateAllPrices = async () => {
            if (rawProducts.length === 0 || categories.length === 0) {
                 if(rawProducts.length > 0) setAllProducts(rawProducts); // set products without price if categories are not yet loaded
                 setLoading(false);
                 return;
            };

            const pricedProducts = await Promise.all(
                rawProducts.map(async (p) => {
                    const category = categories.find(c => c.name === p.category);
                    const productInfo = { vendorSP: p.vendorSP, category: p.category };
                    const displayPrice = await calculateAdminDisplayPrice(productInfo, p.platform, category);
                    return { ...p, displayPrice: displayPrice };
                })
            );
            setAllProducts(pricedProducts);
            setLoading(false);
        };
        
        calculateAllPrices();

    }, [rawProducts, categories]);


    const filteredProducts = React.useMemo(() => {
        let productsToFilter = [...allProducts];
        
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            productsToFilter = productsToFilter.filter(p => 
                p.name.toLowerCase().includes(lowerQuery) ||
                p.id.toLowerCase().includes(lowerQuery) ||
                p.vendor.toLowerCase().includes(lowerQuery) ||
                p.category?.toLowerCase().includes(lowerQuery) ||
                p.sku?.toLowerCase().includes(lowerQuery)
            );
        }

        if (view === 'personal') {
            productsToFilter = productsToFilter.filter(p => p.platform === 'Personalized');
            if(!categorySlugFilter && !vendorIdFilter) setTitle('Personalized Retail Products');
        } else if (view === 'corporate') {
            productsToFilter = productsToFilter.filter(p => p.platform === 'Corporate');
            if(!categorySlugFilter && !vendorIdFilter) setTitle('Corporate & Bulk Products');
        } else if (!categorySlugFilter && !vendorIdFilter) {
            setTitle('All Products');
        }
        return productsToFilter;
    }, [view, allProducts, categorySlugFilter, vendorIdFilter, searchQuery]);

    const getStatusVariant = (status: ProductStatus) => {
        switch (status) {
            case 'Live': return 'default';
            case 'Pending Review': return 'secondary';
            case 'Draft': return 'secondary';
            case 'Declined': return 'destructive';
            default: return 'outline';
        }
    };
    
    const isCorporateView = view === 'corporate';
    
    const formatCurrency = (value?: string | number) => {
        const numValue = typeof value === 'string' ? parseFloat(value.replace('$', '').replace('₹', '')) : value;
        if(value === undefined || value === null || isNaN(numValue)) return 'N/A';
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(numValue);
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold capitalize">{title}</h1>
                    <p className="text-muted-foreground">
                        {filteredProducts.length} products found. Manage all products from all vendors in the marketplace.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                     <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by name, ID, vendor..."
                            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
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
                    <TableHead>Name / ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Vendor SP</TableHead>
                    <TableHead>Customer Price</TableHead>
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
                        <TableCell><div className="space-y-1"><Skeleton className="h-5 w-48" /><Skeleton className="h-3 w-24" /></div></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        {isCorporateView && <TableCell><Skeleton className="h-5 w-12" /></TableCell>}
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                    ) : (
                    filteredProducts.map((product) => {
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
                        <TableCell>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{product.id}</div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(product.status)}>
                            {product.status}
                            </Badge>
                        </TableCell>
                         <TableCell>{product.vendor}</TableCell>
                        <TableCell>{formatCurrency(product.vendorSP)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(product.displayPrice)}</TableCell>
                        <TableCell>
                           <Badge variant={product.platform === 'Corporate' ? 'secondary' : 'outline'}>
                                {product.platform}
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
            <ProductsPageContent />
        </React.Suspense>
    );
}
