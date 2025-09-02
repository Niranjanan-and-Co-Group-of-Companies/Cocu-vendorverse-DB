
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

interface RelatedProductsCarouselProps {
  category?: string;
  currentProductId?: number;
}

export function RelatedProductsCarousel({ category, currentProductId }: RelatedProductsCarouselProps) {
  const [relatedProducts, setRelatedProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (category && currentProductId) {
      getRelatedProducts(category, currentProductId).then(products => {
        setRelatedProducts(products);
        setLoading(false);
      });
    } else {
        setLoading(false);
    }
  }, [category, currentProductId]);

  if (loading) {
    return (
        <div>
            <h2 className="text-2xl font-bold font-headline mb-6">Similar Products</h2>
            <div className="grid grid-cols-4 gap-6">
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
        <h2 className="text-2xl font-bold font-headline mb-6">Similar Products</h2>
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
        <CarouselContent>
            {relatedProducts.map((product) => (
            <CarouselItem key={product.id} className="md:basis-1/3 lg:basis-1/4">
                <Link href={`/products/${product.id}`} className="block">
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
                    </div>
                </CardHeader>
                <CardContent className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold font-headline">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.vendor}</p>
                    <div className="flex-grow"></div>
                    <div className="flex items-end justify-between mt-4">
                    <p className="text-xl font-bold">{product.price}</p>
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
        <CarouselPrevious className="ml-14" />
        <CarouselNext className="mr-14" />
        </Carousel>
    </div>
  );
}
