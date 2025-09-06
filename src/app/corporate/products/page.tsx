
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllProducts } from '@/lib/products-service';
import { getProductsByCategory } from '@/lib/categories-service';
import type { Product } from '@/lib/products';
import { CorporateProductCard } from '@/components/corporate/corporate-product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { calculateDisplayPrice, type DisplayPrice } from '@/lib/pricing-service';
import { getCategoryBySlug } from '@/lib/categories-service';

interface ProductWithPrice extends Product {
    displayPrice: DisplayPrice;
}

function CorporateProductsPageContent() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  
  const [allProducts, setAllProducts] = React.useState<ProductWithPrice[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<ProductWithPrice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sortOption, setSortOption] = React.useState('rating-desc');
  const [title, setTitle] = React.useState('Corporate Product Catalog');
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let products;
      if (categorySlug) {
        const category = await getCategoryBySlug(categorySlug);
        products = await getProductsByCategory(categorySlug);
        setTitle(category?.name || 'Corporate Products');
      } else {
        products = await getAllProducts();
        setTitle('Corporate Product Catalog');
      }
      
      const b2bProducts = products.filter(p => p.moq && p.moq > 0);

      const pricedProducts = await Promise.all(
        b2bProducts.map(async (p) => ({
          ...p,
          displayPrice: await calculateDisplayPrice(p, 'corporate'),
        }))
      );
      
      setAllProducts(pricedProducts);
      setLoading(false);
    };
    fetchData();
  }, [categorySlug]);

  React.useEffect(() => {
    let results = [...allProducts];

    // Sort products
    switch (sortOption) {
      case 'rating-desc':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-asc':
        results.sort((a, b) => a.displayPrice.finalPrice - b.displayPrice.finalPrice);
        break;
      case 'price-desc':
        results.sort((a, b) => b.displayPrice.finalPrice - a.displayPrice.finalPrice);
        break;
    }

    setFilteredProducts(results);
  }, [sortOption, allProducts]);

  const handleActionClick = (actionName: string, productName: string) => {
    toast({
      title: `${actionName} Clicked`,
      description: `Action "${actionName}" was triggered for ${productName}.`,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{title}</h1>
        <p className="text-muted-foreground mt-2">
          Browse all products available for bulk orders and customization.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[520px] w-full" />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <CorporateProductCard 
              key={product.id} 
              product={product} 
              onAction={handleActionClick} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p>No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default function CorporateProductsPage() {
    return (
        <React.Suspense fallback={<Skeleton className="h-screen w-full" />}>
            <CorporateProductsPageContent />
        </React.Suspense>
    )
}
