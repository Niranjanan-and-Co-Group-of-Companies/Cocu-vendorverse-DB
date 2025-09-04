
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, PackageSearch } from 'lucide-react';
import Image from 'next/image';
import { useBidRequest } from '@/hooks/use-bid-request';
import Link from 'next/link';
import { calculateDisplayPrice, type DisplayPrice } from '@/lib/pricing-service';
import type { Product } from '@/lib/products';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductWithPrice extends Product {
    displayPrice?: DisplayPrice;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export function SelectedProductsCard() {
    const { items, removeItem } = useBidRequest();
    const [productsWithPrices, setProductsWithPrices] = React.useState<ProductWithPrice[]>([]);
    const [loadingPrices, setLoadingPrices] = React.useState(true);

    React.useEffect(() => {
        const fetchPrices = async () => {
            setLoadingPrices(true);
            const pricedItems = await Promise.all(
                items.map(async item => {
                    const displayPrice = await calculateDisplayPrice(item, 'corporate');
                    return { ...item, displayPrice };
                })
            );
            setProductsWithPrices(pricedItems);
            setLoadingPrices(false);
        };

        if (items.length > 0) {
            fetchPrices();
        } else {
            setProductsWithPrices([]);
            setLoadingPrices(false);
        }
    }, [items]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Selected Products ({items.length})</CardTitle>
                <CardDescription>
                    These are the products that will be included in your bid request. All must belong to the same category.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-48 pr-4">
                    {items.length > 0 ? (
                        <div className="space-y-3">
                            {productsWithPrices.map(product => (
                                <div key={product.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Image src={product.image} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                                        <div>
                                            <p className="text-sm font-medium truncate">{product.name}</p>
                                            <div className="flex items-center gap-2">
                                                {loadingPrices ? (
                                                    <Skeleton className="h-4 w-20" />
                                                ) : product.displayPrice ? (
                                                    <>
                                                        <span className="text-sm font-semibold">{formatCurrency(product.displayPrice.finalPrice)}</span>
                                                        {product.displayPrice.hasDiscount && (
                                                             <Badge variant="secondary">{product.displayPrice.discountText}</Badge>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-sm font-semibold">{product.price}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(product.id)}>
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                            <PackageSearch className="h-10 w-10 mb-2" />
                            <p className="font-medium">Your bid request is empty.</p>
                            <p className="text-sm">Add products from the catalog to get started.</p>
                            <Button asChild variant="link" size="sm">
                                <Link href="/corporate/products">Browse Products</Link>
                            </Button>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
