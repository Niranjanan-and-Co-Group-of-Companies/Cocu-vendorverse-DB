
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { onAllProductsUpdate, type ProductWithPrice } from '@/lib/products-client-service';
import { CorporateProductCard } from '@/components/corporate/corporate-product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { searchProducts } from '@/ai/flows/search-products-flow';

function CorporateSearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [allProducts, setAllProducts] = React.useState<ProductWithPrice[]>([]);
  const [filteredProductIds, setFilteredProductIds] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sortOption, setSortOption] = React.useState('rating-desc');
  const { toast } = useToast();

  React.useEffect(() => {
    const unsubscribe = onAllProductsUpdate('Corporate', (products) => {
        setAllProducts(products);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!query || allProducts.length === 0) {
        setLoading(false);
        setFilteredProductIds([]);
        return;
    }

    setLoading(true);
    const performSearch = async () => {
        try {
            const productMetadatas = allProducts.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description || '',
                category: p.category || '',
                tags: p.tags || []
            }));

            const result = await searchProducts({ query, products: productMetadatas });
            setFilteredProductIds(result.productIds);

        } catch (error) {
            console.error("AI search failed:", error);
            toast({ title: "Search Error", description: "Could not perform AI search.", variant: "destructive" });
            setFilteredProductIds([]);
        } finally {
            setLoading(false);
        }
    };
    
    performSearch();

  }, [query, allProducts, toast]);

  const searchResults = React.useMemo(() => {
    if (filteredProductIds.length === 0 && !loading) {
      if (query) return [];
      return allProducts;
    }
    const idSet = new Set(filteredProductIds);
    return filteredProductIds.map(id => allProducts.find(p => p.id === id)).filter((p): p is ProductWithPrice => !!p);
  }, [filteredProductIds, allProducts, loading, query]);

  const sortedProducts = React.useMemo(() => {
    let results = [...searchResults];

    switch (sortOption) {
      case 'rating-desc':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price-asc':
        results.sort((a, b) => (a.displayPrice?.finalPrice || 0) - (b.displayPrice?.finalPrice || 0));
        break;
      case 'price-desc':
        results.sort((a, b) => (b.displayPrice?.finalPrice || 0) - (a.displayPrice?.finalPrice || 0));
        break;
    }
    return results;
  }, [sortOption, searchResults]);

  const handleActionClick = (actionName: string, productName: string) => {
    toast({
      title: `${actionName} Clicked`,
      description: `Action "${actionName}" was triggered for ${productName}.`,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Search Results for "{query}"</h1>
        <p className="text-muted-foreground mt-2">
          {sortedProducts.length} corporate products found.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-auto md:ml-auto">
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating-desc">Sort by: Popularity</SelectItem>
              <SelectItem value="price-asc">Sort by: Price (Low to High)</SelectItem>
              <SelectItem value="price-desc">Sort by: Price (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[520px] w-full" />
          ))}
        </div>
      ) : sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {sortedProducts.map(product => (
            <CorporateProductCard 
              key={product.id} 
              product={product} 
              onAction={handleActionClick} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p>No corporate products found matching your search.</p>
        </div>
      )}
    </div>
  );
}

export default function CorporateSearchPage() {
    return (
        <React.Suspense fallback={<Skeleton className="h-screen w-full" />}>
            <CorporateSearchPageContent />
        </React.Suspense>
    )
}
