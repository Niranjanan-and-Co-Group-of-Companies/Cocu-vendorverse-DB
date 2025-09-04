
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { VendorInfoDialog } from './vendor-info-dialog';
import { calculateDisplayPrice, type DisplayPrice } from '@/lib/pricing-service';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { usePathname } from 'next/navigation';

interface ProductInfoProps {
  product: Product;
  displayPrice?: string | null;
  totalPrice?: number | null;
  quantity?: number;
}

export function ProductInfo({ product, totalPrice, quantity }: ProductInfoProps) {
  const [isVendorInfoOpen, setIsVendorInfoOpen] = React.useState(false);
  const [priceInfo, setPriceInfo] = React.useState<DisplayPrice | null>(null);
  const [loadingPrice, setLoadingPrice] = React.useState(true);
  const pathname = usePathname();
  
  const platform = pathname.includes('/corporate') ? 'corporate' : 'personal';

  React.useEffect(() => {
    setLoadingPrice(true);
    calculateDisplayPrice(product, platform).then(info => {
        setPriceInfo(info);
        setLoadingPrice(false);
    });
  }, [product, platform]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const showTotals = totalPrice && quantity && quantity >= (product.moq || 1);

  return (
    <>
        <div className="space-y-4">
        <div>
            {product.category && (
                <Link href={`/category/${product.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="text-sm text-primary font-medium hover:underline">
                    {product.category}
                </Link>
            )}
            <h1 className="text-3xl md:text-4xl font-bold font-headline">{product.name}</h1>
            <p className="text-muted-foreground">
                Sold by <button onClick={() => setIsVendorInfoOpen(true)} className="text-primary hover:underline font-medium">{product.vendor}</button>
            </p>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-primary text-primary" />
                <span className="font-bold text-lg">{product.rating}</span>
                <span className="text-sm text-muted-foreground">(24 ratings)</span>
            </div>
            <div className="flex items-center gap-2">
                {product.stock > 0 && product.stock < 10 && (
                    <span className="text-sm font-medium text-destructive">Low Stock</span>
                )}
                {product.stock === 0 && (
                    <span className="text-sm font-medium text-destructive">Out of Stock</span>
                )}
            </div>
        </div>
        
        <div className="flex flex-col gap-2 rounded-lg border bg-muted/50 p-4">
            {loadingPrice ? (
                <Skeleton className="h-10 w-1/2" />
            ) : priceInfo ? (
                <>
                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-primary">{formatCurrency(priceInfo.finalPrice)}</span>
                        {priceInfo.hasDiscount && (
                            <span className="text-xl text-muted-foreground line-through">{formatCurrency(priceInfo.originalPrice)}</span>
                        )}
                         <span className="text-muted-foreground">/ unit</span>
                    </div>
                    {priceInfo.hasDiscount && (
                        <Badge variant="destructive">{priceInfo.discountText}</Badge>
                    )}
                </>
            ) : null }
             {showTotals && (
                <div className="text-lg">
                    Estimated Total for {quantity} units: <span className="font-bold">{formatCurrency(totalPrice)}</span>
                </div>
            )}
        </div>
        </div>

        <VendorInfoDialog 
            open={isVendorInfoOpen}
            onOpenChange={setIsVendorInfoOpen}
            vendorName={product.vendor}
            vendorBio={product.creatorStory || ''}
        />
    </>
  );
}
