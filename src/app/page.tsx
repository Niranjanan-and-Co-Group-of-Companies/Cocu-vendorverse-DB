import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Users, Building } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

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
              Welcome to <span className="text-primary">GiftSphere</span>
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
              <h2 className="font-headline text-3xl md:text-4xl font-bold">The Perfect Gift Awaits</h2>
              <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
                Whether for a loved one or a corporate client, find the perfect present from our curated collection of vendors.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <Card className="text-center">
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Gift className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline mt-4">Personal Gifting</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Discover unique gifts for every occasion. Surprise and delight your friends and family with a personal touch.
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline mt-4">Corporate Gifting</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Elevate your corporate relationships with memorable gifts that reflect your brand's appreciation and values.
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline mt-4">For Vendors</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Join our marketplace to showcase your unique products to a wide audience of personal and corporate buyers.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Ready to Join GiftSphere?</h2>
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
