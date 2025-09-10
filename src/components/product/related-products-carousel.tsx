
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { getRelatedProducts } from '@/lib/products-service';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '../ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { calculateDisplayPrice, type DisplayPrice } from '@/lib/pricing-service';
import { Badge } from '../ui/badge';
import { onCategoriesWithCommissionsUpdate, type Category } from '@/lib/categories-service';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useToast } from '@/hooks/use-toast';

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
  const { addItem: addToCart } = useCart();
  const { addItem: toggleWishlist, isItemInWishlist } = useWishlist();
  const { toast } = useToast();
  const router = useRouter();


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
                 const productInfo = {
                    id: p.id,
                    vendorSP: p.vendorSP,
                    category: p.category,
                    vendorId: p.vendorId,
                    discountType: p.discountType,
                    discountValue: p.discountValue,
                };
                return {
                    ...p,
                    displayPrice: await calculateDisplayPrice(productInfo, 'Personalized', category),
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
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  
  const handleAddToCart = async (product: Product) => {
    const result = await addToCart(product);
    toast({ title: result.message });
  };

  const handleBuyNow = async (product: Product) => {
    await handleAddToCart(product);
    router.push('/checkout');
  };
  
  const handleWishlistToggle = async (product: Product) => {
    const result = await toggleWishlist(product);
    toast({ title: result.message });
  };


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
            {relatedProducts.map((product) => {
              const inWishlist = isItemInWishlist(product.id);
              return (
            <CarouselItem key={product.id} className="basis-2/3 md:basis-1/3 lg:basis-1/4">
                <Card className="overflow-hidden group h-full flex flex-col">
                <CardHeader className="p-0 relative">
                  <Link href={`${basePath}/products/${product.id}`} className="block aspect-[4/3] bg-muted overflow-hidden">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint="gift product"
                    />
                  </Link>
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-y-2">
                        {product.featured && <Badge>Featured</Badge>}
                        {product.displayPrice.hasDiscount && (
                            <Badge variant="destructive" >{product.displayPrice.discountText}</Badge>
                        )}
                    </div>
                   <Button size="icon" variant="ghost" className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full" onClick={() => handleWishlistToggle(product)}>
                        <Heart className={inWishlist ? "h-4 w-4 fill-red-500 text-red-500" : "h-4 w-4 text-white drop-shadow-md"} />
                        <span className="sr-only">Add to Wishlist</span>
                    </Button>
                </CardHeader>
                <CardContent className="p-4 flex flex-col flex-grow">
                    <Link href={`${basePath}/products/${product.id}`} className="block">
                      <h3 className="text-lg font-bold font-headline">{product.name}</h3>
                    </Link>
                    {product.category && (
                        <Link href={`/category/${product.categorySlug}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            {product.category}
                        </Link>
                    )}
                    <div className="flex-grow"></div>
                    <div className="flex items-baseline gap-2 mt-4">
                        <span className="text-xl font-bold">{formatCurrency(product.displayPrice.finalPrice)}</span>
                        {product.displayPrice.hasDiscount && (
                            <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.displayPrice.originalPrice)}</span>
                        )}
                    </div>
                     <div className="mt-4 flex flex-col gap-2">
                        <div className="flex gap-2">
                            <Button size="sm" className="w-full" onClick={() => handleBuyNow(product)}>Buy Now</Button>
                            <Button size="sm" variant="secondary" className="w-full" onClick={() => handleAddToCart(product)}>
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
            )})}
        </CarouselContent>
        <CarouselPrevious className="-left-4" />
        <CarouselNext className="-right-4" />
        </Carousel>
    </div>
  );
}
