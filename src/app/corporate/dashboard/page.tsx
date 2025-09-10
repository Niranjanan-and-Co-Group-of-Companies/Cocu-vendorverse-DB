
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Gift, Heart, ShoppingCart, Star } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getFeaturedCorporateProducts, type FeaturedProduct } from '@/lib/featured-service';
import { onCategoriesWithCommissionsUpdate, type Category } from '@/lib/categories-service';
import { getActiveCorporateCampaignByPlacement, type Campaign } from '@/lib/marketing-service';
import { calculateDisplayPrice, type DisplayPrice } from '@/lib/pricing-service';
import type { Product } from '@/lib/products';
import { CorporateProductCard } from '@/components/corporate/corporate-product-card';
import { useToast } from '@/hooks/use-toast';
import { YouTubeEmbed } from '@/components/common/youtube-embed';

interface ProductWithPrice extends Product {
    displayPrice: DisplayPrice;
}

const HeroSection = () => {
  const [heroCampaign, setHeroCampaign] = useState<Campaign | null>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveCorporateCampaignByPlacement('homepage-hero').then(campaign => {
      setHeroCampaign(campaign);
      setLoading(false);
    });
  }, []);

  if (loading) {
     return (
      <section className="relative py-20 md:py-32 bg-muted rounded-lg">
        <div className="container text-center">
            <Skeleton className="w-20 h-20 rounded-full mx-auto mb-8" />
            <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
             <div className="mt-8 flex justify-center gap-4">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
             </div>
        </div>
      </section>
     )
  }

  if (!heroCampaign || heroCampaign.creatives.length === 0) {
    // Fallback static hero
    return (
      <section className="relative py-20 md:py-32 bg-muted rounded-lg">
        <div className="container text-center">
          <div className="bg-primary/10 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-8">
             <Gift className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter">
            Corporate Gifting, Perfected
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Discover unique, customizable gifts for your clients, employees, and events.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/corporate/products">Browse All Products</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/corporate/bids/new">Request a Bid</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Dynamic hero from campaign
  return (
    <section className="rounded-lg overflow-hidden">
       <Carousel opts={{ loop: true }} className="w-full">
          <CarouselContent>
            {heroCampaign.creatives.map(creative => (
              <CarouselItem key={creative.id}>
                <div className="relative aspect-[16/9] md:aspect-[21/9] w-full">
                   {creative.videoUrl ? (
                      <YouTubeEmbed url={creative.videoUrl} />
                  ) : creative.imageUrl && (
                      <Image src={creative.imageUrl} alt={creative.title} fill className="object-cover" data-ai-hint="promotional background" />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white p-8">
                       <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter">{creative.title}</h1>
                       <p className="mt-4 max-w-2xl mx-auto text-lg">{creative.description}</p>
                       <Button size="lg" className="mt-8" asChild>
                          <Link href={creative.ctaLink}>{creative.ctaText}</Link>
                       </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {heroCampaign.creatives.length > 1 && (
            <>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </>
          )}
        </Carousel>
    </section>
  )
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

export default function CorporateDashboardPage() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithPrice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let categoriesUnsubscribe: () => void;
    
    const fetchFeatured = async (categoriesForPricing: Category[]) => {
      const featuredData = await getFeaturedCorporateProducts();
      const pricedProducts = await Promise.all(
        featuredData.map(async (p) => {
          const category = categoriesForPricing.find(c => c.name === p.category);
          return {
            ...p,
            displayPrice: await calculateDisplayPrice(p.price, 'corporate', category, p.discountType, p.discountValue),
          }
        })
      );
      setFeaturedProducts(pricedProducts);
    };

    categoriesUnsubscribe = onCategoriesWithCommissionsUpdate('Corporate', (categories) => {
        setCategories(categories);
        fetchFeatured(categories).then(() => {
            setLoading(false);
        });
    });
    
    return () => {
        if(categoriesUnsubscribe) {
            categoriesUnsubscribe();
        }
    };
  }, []);

  const handleActionClick = (actionName: string, productName: string) => {
    toast({
      title: `${actionName} Clicked`,
      description: `Action "${actionName}" was triggered for ${productName}.`,
    });
  };


  return (
    <div className="flex flex-col gap-8">
      <HeroSection />

      <section>
        <div className="text-left">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Featured for Corporate</h2>
            <p className="mt-2 text-muted-foreground">
              Handpicked selections perfect for your business needs, from client appreciation to employee recognition.
            </p>
          </div>
          {loading ? (
              <div className="mt-6 flex justify-center"><Skeleton className="h-96 w-full max-w-6xl" /></div>
          ) : (
          <Carousel opts={{ align: "start", loop: true, }} className="w-full mt-6 -ml-4">
            <CarouselContent>
              {featuredProducts.map((product) => (
                <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                   <CorporateProductCard 
                    key={product.id} 
                    product={product} 
                    onAction={handleActionClick} 
                   />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-16" />
            <CarouselNext className="mr-16"/>
          </Carousel>
          )}
      </section>

      <section>
        <div className="text-left">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Shop by Category</h2>
            <p className="mt-2 text-muted-foreground">
              Find the perfect gift by browsing our curated categories.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
            {loading ? (
              Array.from({length: 8}).map((_, i) => (
                  <Card key={i} className="overflow-hidden relative">
                      <Skeleton className="aspect-[4/3] w-full" />
                  </Card>
              ))
            ) : (categories.map((category) => (
              <Link key={category.slug} href={`/corporate/products?category=${category.slug}`} className="block group">
                <Card className="overflow-hidden relative">
                  <div className="aspect-[4/3] bg-muted">
                     {category.image && <Image src={category.image} alt={category.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" data-ai-hint="category" />}
                  </div>
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <CardContent className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-headline text-lg font-bold text-white">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            )))}
          </div>
      </section>
    </div>
  );
}
