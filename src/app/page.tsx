import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Heart, ShoppingCart, Star } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { allProducts } from '@/lib/products';

const featuredProducts = allProducts.filter(p => p.featured);

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
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
                <Link href="#">Explore Vendors</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-card border-y">
          <div className="container">
            <div className="text-center">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">Featured Gifts</h2>
              <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
                Handpicked for you, discover our most popular and highly-rated gifts from top vendors.
              </p>
            </div>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full mt-12"
            >
              <CarouselContent>
                {featuredProducts.map((product) => (
                  <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="overflow-hidden group h-full flex flex-col">
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
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="ml-14" />
              <CarouselNext className="mr-14"/>
            </Carousel>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Ready to Join VendorVerse?</h2>
            <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
              Create an account today and explore a world of gifting opportunities.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/signup">Sign Up for Free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
