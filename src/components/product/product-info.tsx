
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Tag } from 'lucide-react';
import Link from 'next/link';
import { VendorInfoDialog } from './vendor-info-dialog';
import { calculateDisplayPrice, type DisplayPrice } from '@/lib/pricing-service';
import { onCategoriesWithCommissionsUpdate, type Category } from '@/lib/categories-service';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { usePathname } from 'next/navigation';
import { getPromotionsForProduct } from '@/lib/promotions-actions';
import type { Promotion } from '@/lib/promotions-service';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ProductInfoProps {
  product: Product;
  displayPrice?: string | null;
  totalPrice?: number | null;
  quantity?: number;
}

export function ProductInfo({ product, totalPrice, quantity }: ProductInfoProps) {
  const [isVendorInfoOpen, setIsVendorInfoOpen] = React.useState(false);
  const [priceInfo, setPriceInfo] = React.useState<DisplayPrice | null>(null);
  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [loadingPrice, setLoadingPrice] = React.useState(true);
  const pathname = usePathname();
  
  const platform = pathname.includes('/corporate') ? 'Corporate' : 'Personalized';

  React.useEffect(() => {
    let unsubscribe: () => void;

    async function fetchPrice() {
        setLoadingPrice(true);
        unsubscribe = onCategoriesWithCommissionsUpdate(platform, (categories) => {
            const category = categories.find(c => c.name === product.category);
            const productInfo = {
                id: product.id,
                vendorSP: product.vendorSP,
                categorySlug: product.categorySlug,
                vendorId: product.vendorId,
                discountType: product.discountType,
                discountValue: product.discountValue,
            };
            calculateDisplayPrice(productInfo, platform, category).then(info => {
                setPriceInfo(info);
                setLoadingPrice(false);
            });
        });
    }

    async function fetchPromotions() {
        const applicablePromos = await getPromotionsForProduct(product.id, product.categorySlug || '', product.vendorId);
        setPromotions(applicablePromos.filter(p => p.visibleOnPlatform));
    }

    fetchPrice();
    if(platform === 'Personalized') {
      fetchPromotions();
    }
    
    return () => {
        if(unsubscribe) {
            unsubscribe();
        }
    };
  }, [product, platform]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

  const showTotals = totalPrice && quantity && quantity >= (product.moq || 1);

  return (
    <>
        <div className="space-y-4">
        <div>
            {product.category && (
                <Link href={`/category/${product.categorySlug}`} className="text-sm text-primary font-medium hover:underline">
                    {product.category}
                </Link>
            )}
            <h1 className="text-3xl md:text-4xl font-bold font-headline">{product.name}</h1>
            <p className="text-muted-foreground">
                Sold by <button onClick={() => setIsVendorInfoOpen(true)} className="text-primary hover:underline font-medium">{product.vendor}</button>
            </p>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                {product.stock > 0 && product.stock < 10 && (
                    <span className="text-sm font-medium text-destructive">Low Stock</span>
                )}
                {product.stock === 0 && (
                    <span className="text-sm font-medium text-destructive">Out of Stock</span>
                )}
            </div>
        </div>
        
        <div className="space-y-2">
            {loadingPrice ? (
                <Skeleton className="h-10 w-1/2" />
            ) : priceInfo ? (
                <div className="flex items-baseline gap-3">
                    {priceInfo.hasDiscount && (
                        <Badge variant="destructive">{priceInfo.discountText}</Badge>
                    )}
                    <span className="text-3xl font-bold text-primary">{formatCurrency(priceInfo.finalPrice)}</span>
                    {priceInfo.hasDiscount && (
                        <span className="text-xl text-muted-foreground line-through">{formatCurrency(priceInfo.originalPrice)}</span>
                    )}
                </div>
            ) : null }
             {showTotals && (
                <div className="text-lg">
                    Estimated Total for {quantity} units: <span className="font-bold">{formatCurrency(totalPrice)}</span>
                </div>
            )}
        </div>
        
        {promotions.length > 0 && (
            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Tag className="h-5 w-5"/> Available Offers
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                    {promotions.map(promo => (
                        <div key={promo.id} className="text-sm p-2 rounded-md bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800">
                           <span className="font-semibold">{promo.code}:</span> {promo.description}
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}

        </div>

        <VendorInfoDialog 
            open={isVendorInfoOpen}
            onOpenChange={setIsVendorInfoOpen}
            vendorName={product.vendor}
            vendorBio={''}
        />
    </>
  );
}
