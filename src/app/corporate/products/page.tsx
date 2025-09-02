
'use client';

import * as React from 'react';
import { getAllProducts } from '@/lib/products-service';
import type { Product } from '@/lib/products';
import { CorporateProductCard } from '@/components/corporate/corporate-product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CorporateProductsPage() {
  const [allProducts, setAllProducts] = React.useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortOption, setSortOption] = React.useState('rating-desc');
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const products = await getAllProducts();
      // B2B products are defined as those having a Minimum Order Quantity (MOQ)
      const b2bProducts = products.filter(p => p.moq && p.moq > 0);
      setAllProducts(b2bProducts);
      setFilteredProducts(b2bProducts);
      setLoading(false);
    };
    fetchData();
  }, []);

  React.useEffect(() => {
    let results = [...allProducts];

    // Filter by search query
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(lowerCaseQuery) ||
        p.vendor.toLowerCase().includes(lowerCaseQuery) ||
        p.category?.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // Sort products
    switch (sortOption) {
      case 'rating-desc':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-asc':
        results.sort((a, b) => parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', '')));
        break;
      case 'price-desc':
        results.sort((a, b) => parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', '')));
        break;
    }

    setFilteredProducts(results);
  }, [searchQuery, sortOption, allProducts]);

  const handleActionClick = (actionName: string, productName: string) => {
    toast({
      title: `${actionName} Clicked`,
      description: `Action "${actionName}" was triggered for ${productName}.`,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Corporate Product Catalog</h1>
        <p className="text-muted-foreground mt-2">
          Browse all products available for bulk orders and customization.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products, vendors, or categories..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-auto">
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
            <Skeleton key={i} className="h-[450px] w-full" />
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
