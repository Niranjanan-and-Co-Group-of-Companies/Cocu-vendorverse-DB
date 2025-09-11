
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation';

type VendorType = 'personalized' | 'corporate' | 'both';

export default function VendorSignupPage() {
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [vendorType, setVendorType] = React.useState<VendorType | ''>('');
  const { toast } = useToast();
  const router = useRouter();


  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorType) {
        toast({ title: 'Please select a vendor type', variant: 'destructive'});
        return;
    }
    setStep(2);
  }

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call to create vendor account
    setTimeout(() => {
        setIsLoading(false);
        toast({
            title: "Registration Submitted!",
            description: "Your application is under review. We'll be in touch within 2-3 business days.",
        });
        // Redirect to a confirmation or login page
        router.push('/login');
    }, 1500);
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <Gift className="h-8 w-8 text-primary" />
            <span className="font-headline">VendorVerse</span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Become a Vendor</CardTitle>
            <CardDescription>
                {step === 1 ? 'Start your journey by telling us what you sell.' : 'Complete your registration.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
                <form className="grid gap-6" onSubmit={handleStep1Submit}>
                     <div className="grid gap-2">
                        <Label>What kind of products will you be selling?</Label>
                        <Select value={vendorType} onValueChange={(value) => setVendorType(value as VendorType)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select vendor type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="personalized">Personalized & Retail Products</SelectItem>
                                <SelectItem value="corporate">Corporate & Bulk Products</SelectItem>
                                <SelectItem value="both">Both Personalized & Corporate</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                     <Button type="submit" className="w-full" disabled={!vendorType}>
                        Continue
                     </Button>
                </form>
            ) : (
                 <form className="grid gap-4" onSubmit={handleFinalSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="store-name">Store Name</Label>
                        <Input id="store-name" placeholder="e.g., Creative Crafts Co." required />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="first-name">First Name</Label>
                            <Input id="first-name" placeholder="John" required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="last-name">Last Name</Label>
                            <Input id="last-name" placeholder="Doe" required />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@example.com" required />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required />
                    </div>
                     <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 animate-spin" />}
                         Submit Application
                    </Button>
                 </form>
            )}
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
