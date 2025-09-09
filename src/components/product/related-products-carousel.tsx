

'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { getRelatedProducts } from '@/lib/products-service';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '../ui/button';
import { ShoppingCart } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { calculateDisplayPrice, type DisplayPrice } from '@/lib/pricing-service';
import { Badge } from '../ui/badge';

interface RelatedProductsCarouselProps {
  type: 'category' | 'vendor';
  value?: string;
  currentProductId?: number;
  title: string;
}

interface ProductWithPrice extends Product {
    displayPrice: DisplayPrice;
}

export function RelatedProductsCarousel({ type, value, currentProductId, title }: RelatedProductsCarouselProps) {
  const [relatedProducts, setRelatedProducts] = React.useState<ProductWithPrice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const pathname = usePathname();

  const basePath = pathname.includes('/corporate') ? '/corporate' : '';

  React.useEffect(() => {
    async function fetchAndPriceProducts() {
        if (!value || currentProductId === undefined) {
            setLoading(false);
            return;
        }

        const products = await getRelatedProducts(type, value, currentProductId);
        const platform = pathname.includes('/corporate') ? 'corporate' : 'personal';
        const pricedProducts = await Promise.all(
            products.map(async (p) => ({
                ...p,
                displayPrice: await calculateDisplayPrice(p, platform),
            }))
        );
        setRelatedProducts(pricedProducts);
        setLoading(false);
    }
    fetchAndPriceProducts();
  }, [type, value, currentProductId, pathname]);
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);


  if (loading) {
    return (
        <div>
            <h2 className="text-2xl font-bold font-headline mb-6">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
            </div>
        </div>
    )
  }
  
  if (relatedProducts.length === 0) return null;

  return (
    <div>
        <h2 className="text-2xl font-bold font-headline mb-6">{title}</h2>
        <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent>
            {relatedProducts.map((product) => (
            <CarouselItem key={product.id} className="md:basis-1/3 lg:basis-1/4">
                <Link href={`${basePath}/products/${product.id}`} className="block">
                <Card className="overflow-hidden group h-full flex flex-col">
                <CardHeader className="p-0 relative">
                    <div className="overflow-hidden aspect-[4/3]">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint="gift product"
                    />
                    {product.displayPrice.hasDiscount && (
                        <Badge variant="destructive" className="absolute top-2 left-2 z-10">{product.displayPrice.discountText}</Badge>
                    )}
                    </div>
                </CardHeader>
                <CardContent className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold font-headline">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.vendor}</p>
                    <div className="flex-grow"></div>
                    <div className="flex items-end justify-between mt-4">
                        <div className="flex flex-col">
                            <span className="text-xl font-bold">{formatCurrency(product.displayPrice.finalPrice)}</span>
                            {product.displayPrice.hasDiscount && (
                                <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.displayPrice.originalPrice)}</span>
                            )}
                        </div>
                        <Button size="icon" variant="secondary">
                            <ShoppingCart className="h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
                </Card>
                </Link>
            </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4" />
        <CarouselNext className="-right-4" />
        </Carousel>
    </div>
  );
}
