
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
  const [displayedProductIds, setDisplayedProductIds] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sortOption, setSortOption] = React.useState('relevance');
  const { toast } = useToast();

  React.useEffect(() => {
    const unsubscribe = onAllProductsUpdate('Corporate', (products) => {
        setAllProducts(products);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (allProducts.length === 0 && query) {
        setIsLoading(true);
        return;
    }
    
    setIsLoading(true);
    
    // --- Stage 1: Instant Local Search ---
    if (query) {
        const lowerCaseQuery = query.toLowerCase();
        const localResults = allProducts
            .filter(p => 
                p.name.toLowerCase().includes(lowerCaseQuery) ||
                p.category?.toLowerCase().includes(lowerCaseQuery) ||
                p.tags?.some(t => t.toLowerCase().includes(lowerCaseQuery))
            )
            .map(p => p.id);
        
        setDisplayedProductIds(localResults);
    } else {
        // No query, show all products initially
        setDisplayedProductIds(allProducts.map(p => p.id));
    }
    
    // Even if local search gives results, we want to show loading state while AI is working
    // but only if there is a query. If no query, we show all products without loading state.
    setIsLoading(!!query);

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
            
            // This will trigger the re-render with AI-ordered results
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

  const searchResults = React.useMemo(() => {
    if (displayedProductIds.length === 0) {
      return [];
    }
    const productMap = new Map(allProducts.map(p => [p.id, p]));
    return displayedProductIds.map(id => productMap.get(id)).filter((p): p is ProductWithPrice => !!p);
  }, [displayedProductIds, allProducts]);

  const sortedProducts = React.useMemo(() => {
    let results = [...searchResults];

    // Sorting is only applied AFTER the AI has provided the relevance-sorted list
    if (sortOption === 'price-asc') {
      results.sort((a, b) => (a.displayPrice?.finalPrice || 0) - (b.displayPrice?.finalPrice || 0));
    } else if (sortOption === 'price-desc') {
      results.sort((a, b) => (b.displayPrice?.finalPrice || 0) - (a.displayPrice?.finalPrice || 0));
    }
    // 'relevance' is the default order from the AI, so no sorting needed.
    
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
        <h1 className="text-3xl font-bold font-headline">
          {query ? `Search Results for "${query}"` : "Corporate Product Catalog"}
        </h1>
        <p className="text-muted-foreground mt-2">
            {!isLoading ? `${sortedProducts.length} corporate products found.` : 'Searching...'}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-auto md:ml-auto">
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
