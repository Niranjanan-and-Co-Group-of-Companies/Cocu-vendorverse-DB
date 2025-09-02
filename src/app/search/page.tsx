
'use client'

import { useSearchParams } from 'next/navigation';
import { allProducts, Product } from '@/lib/products';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const searchResults = allProducts.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.vendor.toLowerCase().includes(query.toLowerCase()) ||
    product.description?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container py-8">
        <h1 className="text-2xl font-bold mb-4">
          Search results for &quot;{query}&quot;
        </h1>
        
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {searchResults.map((product) => (
              <Card key={product.id} className="overflow-hidden group h-full flex flex-col">
                <CardHeader className="p-0 relative">
                  {product.featured && <Badge className="absolute top-2 left-2 z-10">Featured</Badge>}
                  <Button size="icon" variant="outline" className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-background">
                    <Heart className="h-4 w-4" />
                    <span className="sr-only">Add to Wishlist</span>
                  </Button>
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={600}
                    height={400}
                    className="object-cover aspect-video group-hover:scale-105 transition-transform duration-300"
                    data-ai-hint="gift product"
                  />
                </CardHeader>
                <CardContent className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold font-headline">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">by {product.vendor}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <div className="flex-grow"></div>
                  <div className="flex items-end justify-between mt-4">
                    <p className="text-xl font-bold">{product.price}</p>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button size="sm" className="w-full">Buy Now</Button>
                      <Button size="sm" variant="secondary" className="w-full">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                    {product.customizable && (
                      <Button size="sm" variant="outline" className="w-full">Customise Now</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No products found matching your search.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
