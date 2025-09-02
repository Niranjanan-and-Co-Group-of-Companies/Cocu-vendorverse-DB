
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { searchProductsAndVendors, addFeatured, type ProductSearchResult } from '@/lib/featured-service';

interface AddFeaturedProductProps {
  featuredProductIds: number[];
}

export function AddFeaturedProduct({ featuredProductIds }: AddFeaturedProductProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchType, setSearchType] = React.useState<'product' | 'vendor'>('product');
  const [results, setResults] = React.useState<ProductSearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();
  
  React.useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }
    
    const debounce = setTimeout(async () => {
        setLoading(true);
        const searchResults = await searchProductsAndVendors(searchQuery);
        // Prioritize product results, then vendor results
        const productResults = searchResults.filter(r => r.type === 'product');
        const vendorResults = searchResults.filter(r => r.type === 'vendor');
        setResults([...productResults, ...vendorResults]);
        setLoading(false);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleAdd = async (productId: number, productName: string) => {
    try {
        await addFeatured(productId);
        toast({
            title: "Product Featured",
            description: `"${productName}" has been added to the featured list.`
        });
    } catch (error) {
        console.error("Failed to add featured product:", error);
        toast({ title: 'Error', description: 'Could not feature this product.', variant: 'destructive' });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Products to Feature</CardTitle>
        <CardDescription>Search for products or vendors to add them to the featured list.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products or vendors..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="h-72 mt-4 pr-4">
            {results.length > 0 ? (
                 <div className="space-y-2">
                    {results.map(item => {
                        if (item.type === 'product') {
                            return (
                                <div key={`prod-${item.id}`} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Image src={item.image!} alt={item.name} width={32} height={32} className="rounded-md" />
                                        <div>
                                            <p className="text-sm font-medium truncate">{item.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{item.vendorName}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost" disabled={featuredProductIds.includes(item.id)} onClick={() => handleAdd(item.id, item.name)}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add
                                    </Button>
                                </div>
                            )
                        }
                        // This part will be enhanced to list products under a vendor
                        return null;
                    })}
                 </div>
            ) : (
                <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                        {loading ? 'Searching...' : 'Start typing to find products.'}
                    </p>
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
