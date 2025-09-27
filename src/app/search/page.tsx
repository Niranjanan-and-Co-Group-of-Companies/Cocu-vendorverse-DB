
'use client'

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Product } from '@/lib/products';
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
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useToast } from '@/hooks/use-toast';
import { onAllProductsUpdate, type ProductWithPrice } from '@/lib/products-client-service';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { searchProducts } from '@/ai/flows/search-products-flow';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [allProducts, setAllProducts] = useState<ProductWithPrice[]>([]);
  const [displayedProductIds, setDisplayedProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [sortOption, setSortOption] = React.useState('relevance');
  
  const { addItem: addToCart } = useCart();
  const { addItem: toggleWishlist, isItemInWishlist } = useWishlist();
  const { toast } = useToast();


  useEffect(() => {
    const unsubscribe = onAllProductsUpdate('Personalized', (pricedProducts) => {
        setAllProducts(pricedProducts);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (allProducts.length === 0 && query) {
        setIsLoading(true);
        return;
    }
    
    // Set loading state only when there is a query to be processed.
    setIsLoading(!!query);
    
    // --- Stage 1: Instant Local Search ---
    let localResults: string[];
    if (query) {
        const lowerCaseQuery = query.toLowerCase();
        localResults = allProducts
            .filter(p => 
                p.name.toLowerCase().includes(lowerCaseQuery) ||
                p.category?.toLowerCase().includes(lowerCaseQuery) ||
                p.tags?.some(t => t.toLowerCase().includes(lowerCaseQuery))
            )
            .map(p => p.id);
    } else {
        // If no query, show all products initially without AI search.
        localResults = allProducts.map(p => p.id);
    }
    setDisplayedProductIds(localResults);


    // --- Stage 2: AI Search ---
    const performAiSearch = async () => {
        if (!query) {
            setIsLoading(false); // No query, so we are done.
            return;
        }

        try {
            const productMetadatas = allProducts.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description || '',
                category: p.category || '',
                tags: p.tags || []
            }));

            const result = await searchProducts({ query, products: productMetadatas });
            setDisplayedProductIds(result.productIds);

        } catch (error) {
            console.error("AI search failed:", error);
            toast({ title: "AI Search Error", description: "Could not perform AI-powered search. Displaying standard results.", variant: "destructive" });
            // The local results will remain displayed.
        } finally {
            setIsLoading(false); // AI search is complete, hide loading skeletons.
        }
    };
    
    performAiSearch();

  }, [query, allProducts, toast]);

  const searchResults = useMemo(() => {
    if (displayedProductIds.length === 0) {
      return [];
    }
    const productMap = new Map(allProducts.map(p => [p.id, p]));
    return displayedProductIds.map(id => productMap.get(id)).filter((p): p is ProductWithPrice => !!p);
  }, [displayedProductIds, allProducts]);

  const sortedAndFilteredProducts = useMemo(() => {
    let productsToShow = showOutOfStock ? searchResults : searchResults.filter(p => p.stock > 0);

    let sorted = [...productsToShow];
    if (sortOption === 'price-asc') {
      sorted.sort((a, b) => (a.displayPrice?.finalPrice || 0) - (b.displayPrice?.finalPrice || 0));
    } else if (sortOption === 'price-desc') {
      sorted.sort((a, b) => (b.displayPrice?.finalPrice || 0) - (a.displayPrice?.finalPrice || 0));
    }
    // 'relevance' is default AI order
    return sorted;
  }, [searchResults, showOutOfStock, sortOption]);

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


  return (
    <main className="flex-grow container py-8">
        <h1 className="text-2xl font-bold mb-2">
          {query ? `Search results for "${query}"` : 'All Products'}
        </h1>
         <p className="text-muted-foreground mb-4">
            {!isLoading ? `${sortedAndFilteredProducts.length} products found.` : 'Searching...'}
         </p>
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
                <Switch id="out-of-stock-toggle" checked={showOutOfStock} onCheckedChange={setShowOutOfStock} />
                <Label htmlFor="out-of-stock-toggle">Include out of stock</Label>
            </div>
             <div className="w-full md:w-auto md:ml-auto max-w-xs">
                <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="relevance">Sort by: Relevance</SelectItem>
                        <SelectItem value="price-asc">Sort by: Price (Low to High)</SelectItem>
                        <SelectItem value="price-desc">Sort by: Price (High to Low)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        
        {isLoading ? (
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
        ) : sortedAndFilteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sortedAndFilteredProducts.map((product) => {
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
                  <Link href={`/products/${product.id}`}>
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
            <p className="text-muted-foreground">No products found matching your search.</p>
          </div>
        )}
      </main>
  )
}


export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <Suspense>
        <SearchResultsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
