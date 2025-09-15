

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Heart, ShoppingCart } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { Category } from '@/lib/categories-service';
import { onCategoriesWithCommissionsUpdate } from '@/lib/categories-service';
import { getActiveCampaignByPlacement, type Campaign } from '@/lib/marketing-service';
import React, { useEffect, useState } from 'react';
import type { Product } from '@/lib/products';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { YouTubeEmbed } from '@/components/common/youtube-embed';
import { onFeaturedProductsUpdate, type ProductWithPrice } from '@/lib/products-client-service';


const HeroSection = () => {
  const [heroCampaign, setHeroCampaign] = useState<Campaign | null>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveCampaignByPlacement('homepage-hero').then(campaign => {
      // A null value means no active campaign was found
      setHeroCampaign(campaign);
      setLoading(false);
    });
  }, []);

  if (loading) {
     return (
      <section className="relative py-20 md:py-32">
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
      <section className="relative py-20 md:py-32">
        <div className="container text-center">
          <div className="bg-primary/10 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-8">
             <Gift className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter">
            Welcome to <span className="text-primary">VendorVerse</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            A universe of unique gifts from diverse vendors, perfect for personal and corporate occasions.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Start Gifting</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/search?q=">Explore Products</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Dynamic hero from campaign
  return (
    <section>
       <Carousel
          opts={{ loop: true, }}
          className="w-full"
        >
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

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithPrice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem: addToCart } = useCart();
  const { addItem: toggleWishlist, isItemInWishlist } = useWishlist();
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    const unsubFeatured = onFeaturedProductsUpdate('Personalized', (products) => {
        setFeaturedProducts(products.filter(p => p.stock > 0));
        setLoading(false);
    });

    const unsubCategories = onCategoriesWithCommissionsUpdate('Personalized', (categories) => {
        setCategories(categories);
    });

    return () => {
        unsubFeatured();
        unsubCategories();
    };
  }, []);

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
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <HeroSection />

        <section className="py-20 md:py-28 bg-card border-y">
          <div className="container">
            <div className="text-center">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">Featured Gifts</h2>
              <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
                Handpicked for you, discover our most popular and highly-rated gifts from top vendors.
              </p>
            </div>
            {loading ? (
                <div className="mt-12 flex justify-center"><Skeleton className="h-96 w-full max-w-5xl" /></div>
            ) : (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full mt-12"
            >
              <CarouselContent>
                {featuredProducts.map((product) => {
                  const inWishlist = isItemInWishlist(product.id);
                  return (
                  <CarouselItem key={product.id} className="basis-2/3 md:basis-1/2 lg:basis-1/3">
                    <Card className="overflow-hidden group h-full flex flex-col">
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
                        <Link href={`/products/${product.id}`} className="block">
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
                  </CarouselItem>
                )})}
              </CarouselContent>
              <CarouselPrevious className="ml-14" />
              <CarouselNext className="mr-14"/>
            </Carousel>
            )}
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container">
            <div className="text-center">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">Shop by Category</h2>
              <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
                Find the perfect gift by browsing our curated categories.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-12">
              {categories.length === 0 ? (
                Array.from({length: 8}).map((_, i) => (
                    <Card key={i} className="overflow-hidden relative">
                        <Skeleton className="aspect-[4/3] w-full" />
                    </Card>
                ))
              ) : (categories.map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`} className="block group">
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
