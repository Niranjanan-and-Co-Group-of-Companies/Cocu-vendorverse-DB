

'use client'

import { Product } from '@/lib/products';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { getCategoryBySlug, getProductsByCategory, onCategoriesWithCommissionsUpdate } from '@/lib/categories-service';
import type { Category } from '@/lib/categories-service';
import React from 'react';
import { calculateDisplayPrice, DisplayPrice } from '@/lib/pricing-service';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ProductWithPrice extends Product {
    displayPrice?: DisplayPrice;
}

function CategoryPageContent({ slug }: { slug: string }) {
  const [products, setProducts] = useState<ProductWithPrice[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem: addToCart } = useCart();
  const { addItem: toggleWishlist, isItemInWishlist } = useWishlist();
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    let categoriesUnsubscribe: () => void;

    const fetchData = async (categories: Category[]) => {
      setLoading(true);
      const categoryData = await getCategoryBySlug(slug);

      if (categoryData) {
        const productData = await getProductsByCategory(slug);
        const pricedProducts = await Promise.all(
            productData.map(async p => ({
                ...p,
                displayPrice: await calculateDisplayPrice(p.price, 'Personalized', categories.find(c => c.id === categoryData.id), p.discountType, p.discountValue),
            }))
        );
        setProducts(pricedProducts);
      }
      
      setCategory(categoryData);
      setLoading(false);
    };

    categoriesUnsubscribe = onCategoriesWithCommissionsUpdate('Personalized', (categories) => {
        fetchData(categories);
    });
    
    return () => {
        if(categoriesUnsubscribe) {
            categoriesUnsubscribe();
        }
    };
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


  if (loading) {
    return (
        <main className="flex-grow container py-8">
            <Skeleton className="h-8 w-1/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden group h-full flex flex-col">
                    <CardHeader className="p-0 relative">
                    <Skeleton className="aspect-[4/3] w-full" />
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col flex-grow gap-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                    <div className="flex-grow"></div>
                    <Skeleton className="h-8 w-1/3" />
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
            <p className="text-muted-foreground mb-8">{products.length} products</p>
            
            {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => {
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
                            {product.displayPrice?.hasDiscount && <Badge variant="destructive" >{product.displayPrice.discountText}</Badge>}
                            {product.featured && <Badge>Featured</Badge>}
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
                    <div className="flex items-center gap-1 mt-2">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-sm font-medium">{product.rating}</span>
                    </div>
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
                        <Button size="sm" variant="secondary" className="w-full" onClick={() => handleAddToCart(product)}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add to Cart
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
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
       <Suspense fallback={<div>Loading...</div>}>
         <CategoryPageContent slug={params.slug} />
       </Suspense>
      <Footer />
    </div>
  );
}
