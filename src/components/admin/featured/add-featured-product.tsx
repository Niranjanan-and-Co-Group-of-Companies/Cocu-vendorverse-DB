

'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { addFeatured } from '@/lib/featured-service';
import { type Product } from '@/lib/products';
import { collection, onSnapshot, query, where, orderBy, startAt, endAt } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AddFeaturedProductProps {
  featuredProductIds: string[];
}

export function AddFeaturedProduct({ featuredProductIds }: AddFeaturedProductProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
        collection(db, 'products'),
        orderBy('name_lowercase'),
        startAt(searchQuery.toLowerCase()),
        endAt(searchQuery.toLowerCase() + '\uf8ff')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => doc.data() as Product);
        setSearchResults(products);
        setLoading(false);
    }, (error) => {
        console.error("Error searching products:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [searchQuery]);
  

  const handleAdd = async (productId: string, productName: string) => {
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
           {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
        </div>
        <ScrollArea className="h-72 mt-4 pr-4">
            {searchResults.length > 0 ? (
                 <div className="space-y-2">
                    {searchResults.map(item => (
                        <div key={`prod-${item.id}`} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Image src={item.image!} alt={item.name} width={32} height={32} className="rounded-md" />
                                <div>
                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{item.vendor}</p>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost" disabled={featuredProductIds.includes(String(item.id))} onClick={() => handleAdd(String(item.id), item.name)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add
                            </Button>
                        </div>
                    ))}
                 </div>
            ) : (
                <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                        {loading ? 'Searching...' : (searchQuery.length > 1 ? 'No results found.' : 'Start typing to find products.')}
                    </p>
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
