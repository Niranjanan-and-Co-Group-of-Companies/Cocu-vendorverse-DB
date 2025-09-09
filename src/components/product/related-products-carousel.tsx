

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
import { onCategoriesWithCommissionsUpdate, type Category } from '@/lib/categories-service';

interface RelatedProductsCarouselProps {
  type: 'category' | 'vendor';
  value?: string;
  currentProductId?: string;
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
  const platform = basePath === '/corporate' ? 'Corporate' : 'Personalized';

  React.useEffect(() => {
    let categoriesUnsubscribe: () => void;
    async function fetchAndPriceProducts(categories: Category[]) {
        if (!value || currentProductId === undefined) {
            setLoading(false);
            return;
        }

        const products = await getRelatedProducts(type, value, currentProductId);
        
        const pricedProducts = await Promise.all(
            products.map(async (p) => {
                const category = categories.find(c => c.name === p.category);
                return {
                    ...p,
                    displayPrice: await calculateDisplayPrice(p.price, platform, category, p.discountType, p.discountValue),
                }
            })
        );
        setRelatedProducts(pricedProducts);
        setLoading(false);
    }

    categoriesUnsubscribe = onCategoriesWithCommissionsUpdate(platform, (categories) => {
        fetchAndPriceProducts(categories);
    });

    return () => {
        if (categoriesUnsubscribe) {
            categoriesUnsubscribe();
        }
    }
  }, [type, value, currentProductId, platform]);
  
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
                <Card className="overflow-hidden group h-full flex flex-col">
                <CardHeader className="p-0 relative">
                  <Link href={`${basePath}/products/${product.id}`} className="block">
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
                  </Link>
                </CardHeader>
                <CardContent className="p-4 flex flex-col flex-grow">
                    <Link href={`${basePath}/products/${product.id}`} className="block">
                      <h3 className="text-lg font-bold font-headline">{product.name}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">{product.vendor}</p>
                    <div className="flex-grow"></div>
                    <div className="flex items-end justify-between mt-4">
                        <div className="flex flex-col">
                            <span className="text-xl font-bold">{formatCurrency(product.displayPrice.finalPrice)}</span>
                            {product.displayPrice.hasDiscount && (
                                <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.displayPrice.originalPrice)}</span>
                            )}
                        </div>
                    </div>
                     <div className="mt-4 flex flex-col gap-2">
                        <div className="flex gap-2">
                            <Button size="sm" className="w-full">Buy Now</Button>
                            <Button size="sm" variant="secondary" className="w-full">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add to Cart
                            </Button>
                        </div>
                        {product.customizable && (
                            <Button asChild size="sm" variant="outline" className="w-full">
                               <Link href={`${basePath}/customize/${product.id}`}>Customise Now</Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
                </Card>
            </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4" />
        <CarouselNext className="-right-4" />
        </Carousel>
    </div>
  );
}
