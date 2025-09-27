
'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Heart, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import type { Category } from '@/lib/categories-service';
import React from 'react';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { onProductsByCategoryUpdate, type ProductWithPrice } from '@/lib/products-client-service';
import type { Product } from '@/lib/products';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

function CategoryPageContent({ slug }: { slug: string }) {
  const [products, setProducts] = useState<ProductWithPrice[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const { addItem: addToCart } = useCart();
  const { addItem: toggleWishlist, isItemInWishlist } = useWishlist();
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const unsubscribe = onProductsByCategoryUpdate(slug, 'Personalized', (pricedProducts, categoryData) => {
        setProducts(pricedProducts);
        setCategory(categoryData);
        setLoading(false);
    });
    
    return () => unsubscribe();
  }, [slug]);
  
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

  const filteredProducts = useMemo(() => {
    if (showOutOfStock) {
      return products;
    }
    return products.filter(p => p.stock > 0);
  }, [products, showOutOfStock]);


  if (loading) {
    return (
        <main className="flex-grow container py-8">
            <Skeleton className="h-8 w-1/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden group h-full flex flex-col">
                    <CardHeader className="p-0 relative">
                    <Skeleton className="aspect-[4/3] w-full" />
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col flex-grow gap-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex-grow"></div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>
      </main>
    )
  }

  return (
      <main className="flex-grow container py-8">
        {category ? (
            <>
            <h1 className="text-3xl font-bold font-headline mb-2">{category.name}</h1>
            <p className="text-muted-foreground mb-4">{filteredProducts.length} products</p>
            <div className="flex items-center space-x-2 mb-8">
                <Switch id="out-of-stock-toggle" checked={showOutOfStock} onCheckedChange={setShowOutOfStock} />
                <Label htmlFor="out-of-stock-toggle">Include out of stock</Label>
            </div>
            
            {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => {
                  const inWishlist = isItemInWishlist(product.id);
                  return (
                <Card key={product.id} className="overflow-hidden group h-full flex flex-col">
                    <CardHeader className="p-0 relative">
                        <Link href={`/products/${product.id}`} className="block w-full h-full">
                            <div className="overflow-hidden aspect-[4/3]">
                                <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                data-ai-hint="gift product"
                                />
                            </div>
                        </Link>
                         <div className="absolute top-2 left-2 z-10 flex flex-col gap-y-2">
                            {product.featuredOnPersonal && <Badge>Featured</Badge>}
                            {product.displayPrice?.hasDiscount && <Badge variant="destructive" >{product.displayPrice.discountText}</Badge>}
                        </div>
                        <Button size="icon" variant="ghost" className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full" onClick={() => handleWishlistToggle(product)}>
                            <Heart className={inWishlist ? "h-4 w-4 fill-red-500 text-red-500" : "h-4 w-4 text-white drop-shadow-md"} />
                            <span className="sr-only">Add to Wishlist</span>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col flex-grow">
                     <Link href={`/products/${product.id}`} className="block">
                        <h3 className="text-lg font-bold font-headline">{product.name}</h3>
                    </Link>
                    {product.category && (
                        <Link href={`/category/${product.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            {product.category}
                        </Link>
                    )}
                    <div className="flex-grow"></div>
                    <div className="flex items-end justify-between mt-4">
                        {product.displayPrice ? (
                            <div className="flex flex-col">
                                <span className="text-xl font-bold">{formatCurrency(product.displayPrice.finalPrice)}</span>
                                {product.displayPrice.hasDiscount && (
                                    <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.displayPrice.originalPrice)}</span>
                                )}
                            </div>
                        ) : (
                            <p className="text-xl font-bold">{product.price}</p>
                        )}
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                        <div className="flex gap-2">
                            <Button size="sm" className="w-full" onClick={() => handleBuyNow(product)}>Buy Now</Button>
                            <Button size="sm" variant="secondary" className="md:w-full md:px-3" onClick={() => handleAddToCart(product)}>
                                <ShoppingCart className="mr-0 md:mr-2 h-4 w-4" />
                                <span className="hidden md:inline">Add to Cart</span>
                            </Button>
                        </div>
                        {product.customizable && (
                        <Button asChild size="sm" variant="outline" className="w-full"><Link href={`/customize/${product.id}`}>Customise Now</Link></Button>
                        )}
                    </div>
                    </CardContent>
                </Card>
                )})}
            </div>
            ) : (
            <div className="text-center py-16">
                <p className="text-muted-foreground">No products found in this category yet.</p>
            </div>
            )}
            </>
        ) : (
            <div className="text-center py-16">
                <h1 className="text-2xl font-bold">Category not found</h1>
                <p className="text-muted-foreground mt-2">The category you are looking for does not exist.</p>
                <Button asChild className="mt-4">
                    <Link href="/">Go back to Home</Link>
                </Button>
            </div>
        )}
      </main>
  );
}


export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = React.use(params);
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
       <Suspense fallback={<div>Loading...</div>}>
         <CategoryPageContent slug={slug} />
       </Suspense>
      <Footer />
    </div>
  );
}
