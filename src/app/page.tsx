import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, FileText } from 'lucide-react';
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
               <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 text-primary"
              >
                <path d="m12 14 4-4" />
                <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                <path d="m12 20 4-4" />
              </svg>
            </div>
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter">
              Welcome to <span className="text-primary">VendorVerse</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Your all-in-one platform for seamless vendor and customer collaboration. Find products, manage orders, and grow your business.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-card border-y">
          <div className="container">
            <div className="text-center">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">Why VendorVerse?</h2>
              <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
                We provide the tools you need to succeed, whether you're a customer or a vendor.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <Card className="text-center">
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline mt-4">For Customers</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Access a vast product catalog, place orders with ease, and manage your requirements all in one place.
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
                  Showcase your products, receive orders, and bid on corporate requirements to expand your business reach.
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-headline mt-4">Bidding System</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Our transparent bidding system allows vendors to compete for corporate contracts fairly and efficiently.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Ready to Join?</h2>
            <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
              Create an account today and explore the world of opportunities on VendorVerse.
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
