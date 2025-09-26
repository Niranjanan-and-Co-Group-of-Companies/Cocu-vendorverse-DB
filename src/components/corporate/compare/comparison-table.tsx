
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Check, Star, X as XIcon } from 'lucide-react';
import { ComparisonTableHeader } from './comparison-table-header';
import { ComparisonTableActions } from './comparison-table-actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { calculateDisplayPrice, type DisplayPrice } from '@/lib/pricing-service';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { getCategoryByName } from '@/lib/categories-service';
import { Badge } from '@/components/ui/badge';

interface ComparisonTableProps {
  products: Product[];
}

interface ProductWithPrice extends Product {
    displayPrice?: DisplayPrice;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

const featureRows = [
    { 
        label: "Price", 
        getValue: (p: ProductWithPrice) => p.displayPrice ? (
             <div className="flex flex-col gap-1 items-start">
                <span className="font-bold text-primary">{formatCurrency(p.displayPrice.finalPrice)}</span>
                {p.displayPrice.hasDiscount && (
                    <>
                        <span className="text-xs text-muted-foreground line-through">{formatCurrency(p.displayPrice.originalPrice)}</span>
                        <Badge variant="destructive">{p.displayPrice.discountText}</Badge>
                    </>
                )}
            </div>
        ) : <Skeleton className="h-6 w-16" />
    },
    { label: "Rating", getValue: (p: Product) => (
        <span className="text-muted-foreground text-xs">Coming soon</span>
    )},
    { label: "Min. Order Qty (MOQ)", getValue: (p: Product) => p.moq || '1' },
    { label: "Customizable", getValue: (p: Product) => p.customizable ? <Check className="text-green-600"/> : <XIcon className="text-destructive"/> },
    { 
        label: "Category", 
        getValue: (p: Product) => p.category ? (
            <Link href={`/corporate/products?category=${p.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="hover:underline text-primary">
                {p.category}
            </Link>
        ) : 'N/A'
    },
    { label: "Vendor", getValue: (p: Product) => p.vendor },
];


export function ComparisonTable({ products }: ComparisonTableProps) {
  const [productsWithPrices, setProductsWithPrices] = React.useState<ProductWithPrice[]>([]);

    React.useEffect(() => {
    let isMounted = true;
    const fetchPrices = async () => {
        const pricedProducts = await Promise.all(
            products.map(async p => {
                const category = await getCategoryByName(p.category);
                const productInfo = {
                    id: p.id,
                    vendorSP: p.vendorSP,
                    category: p.category,
                    vendorId: p.vendorId,
                    discountType: p.discountType,
                    discountValue: p.discountValue,
                    price: p.price,
                    tieredPricing: p.tieredPricing,
                };
                return ({
                    ...p,
                    displayPrice: await calculateDisplayPrice(productInfo, 'Corporate', category || undefined)
                })
            })
        );
        if (isMounted) {
            setProductsWithPrices(pricedProducts);
        }
    }
    fetchPrices();
    return () => { isMounted = false };
  }, [products]);
  
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-lg border">
      <Table className="min-w-full table-fixed">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-48 sticky left-0 bg-background z-10">Product</TableHead>
            {productsWithPrices.map(product => (
                <TableHead key={product.id} className="w-56">
                    <ComparisonTableHeader product={product} />
                </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {featureRows.map((feature, index) => (
            <TableRow key={feature.label} className={cn(index % 2 === 1 && 'bg-muted/50')}>
                <TableCell className="w-48 sticky left-0 bg-inherit z-10 font-semibold">{feature.label}</TableCell>
                {productsWithPrices.map(product => (
                    <TableCell key={`${product.id}-${feature.label}`} className="text-sm">
                        {feature.getValue(product)}
                    </TableCell>
                ))}
            </TableRow>
          ))}
           <TableRow className={cn(featureRows.length % 2 === 1 && 'bg-muted/50', "hover:bg-transparent")}>
                <TableCell className="w-48 sticky left-0 bg-inherit z-10 font-semibold">Actions</TableCell>
                {productsWithPrices.map(product => (
                    <TableCell key={`action-${product.id}`} className="text-sm">
                        <ComparisonTableActions product={product} />
                    </TableCell>
                ))}
            </TableRow>
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
