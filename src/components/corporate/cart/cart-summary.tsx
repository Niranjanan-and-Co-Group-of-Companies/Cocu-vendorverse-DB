
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { CartItem } from '@/hooks/use-corporate-cart';
import { Input } from '@/components/ui/input';
import { Tag, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPromotionByCode, getPromotionsForProduct } from '@/lib/promotions-actions';
import type { PlainPromotion } from '@/lib/promotions-service';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CartSummaryProps {
  items: CartItem[];
}

export function CartSummary({ items }: CartSummaryProps) {
  const { toast } = useToast();
  const [couponInput, setCouponInput] = React.useState('');
  const [appliedPromotions, setAppliedPromotions] = React.useState<PlainPromotion[]>([]);
  const [isApplying, setIsApplying] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);

  React.useEffect(() => {
    const findAndApplyBestPromotion = async () => {
        if (items.length === 0) {
            setAppliedPromotions([]);
            return;
        }

        let allEligiblePromos: PlainPromotion[] = [];
        for (const item of items) {
            const promos = await getPromotionsForProduct(item.id, item.category || '', item.vendorId, 'Corporate');
            const visiblePromos = promos.filter(p => p.visibleOnPlatform && p.type !== 'Free Shipping');
            visiblePromos.forEach(p => {
              if (!allEligiblePromos.some(ep => ep.id === p.id)) {
                allEligiblePromos.push(p);
              }
            });
        }
        
        let bestPromo: PlainPromotion | null = null;
        let maxDiscount = 0;

        for (const promo of allEligiblePromos) {
            let currentDiscount = 0;
            const applicableItems = (promo.appliesTo?.products?.length || 0) > 0 
                ? items.filter(item => promo.appliesTo!.products.includes(item.id))
                : items;
            
            const applicableSubtotal = applicableItems.reduce((sum, item) => sum + (item.displayPrice?.originalPrice || parseFloat(item.price)) * item.quantity, 0);

            if (promo.type === 'Percentage') {
                currentDiscount = applicableSubtotal * (promo.value / 100);
            } else if (promo.type === 'Fixed Amount') {
                currentDiscount = Math.min(promo.value, applicableSubtotal);
            }

            if (currentDiscount > maxDiscount) {
                maxDiscount = currentDiscount;
                bestPromo = promo;
            }
        }
        
        setAppliedPromotions(prev => {
            const manualPromos = prev.filter(p => !p.visibleOnPlatform);
            return bestPromo ? [bestPromo, ...manualPromos] : manualPromos;
        });
    };

    findAndApplyBestPromotion();
  }, [items]);


  const subtotal = React.useMemo(() => {
    return items.reduce((total, item) => {
      const price = item.displayPrice?.finalPrice || 0;
      return total + price * item.quantity;
    }, 0);
  }, [items]);

  const discountAmount = React.useMemo(() => {
    return appliedPromotions.reduce((totalDiscount, promo) => {
      let discount = 0;
      
      const isProductSpecific = promo.appliesTo?.products?.length > 0;
      
      const applicableItems = isProductSpecific 
        ? items.filter(item => promo.appliesTo!.products.includes(item.id))
        : items;
          
      const applicableSubtotal = applicableItems.reduce((sum, item) => sum + (item.displayPrice?.originalPrice || parseFloat(item.price)) * item.quantity, 0);

      if (promo.type === 'Percentage') {
          discount = applicableSubtotal * (promo.value / 100);
      } else if (promo.type === 'Fixed Amount') {
          discount = Math.min(promo.value, applicableSubtotal);
      }
      return totalDiscount + discount;
    }, 0);
  }, [appliedPromotions, items]);

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setIsApplying(true);
    const promo = await getPromotionByCode(couponInput);
    setIsApplying(false);

    if (!promo || promo.platform === 'Personalized') {
        toast({ title: "Invalid Coupon", description: "This coupon is not valid for corporate orders.", variant: "destructive" });
        return;
    }

    if (appliedPromotions.some(p => p.id === promo.id)) {
        toast({ title: "Coupon Already Applied", variant: "destructive" });
        return;
    }
    
    if (promo.visibleOnPlatform) {
        toast({ title: "Automatic Discount", description: "This discount is applied automatically if it's the best offer for your cart.", variant: "destructive" });
        return;
    }

    const hasManualPromo = appliedPromotions.some(p => !p.visibleOnPlatform);

    if (hasManualPromo) {
        toast({ title: "Limit Reached", description: "You can only apply one manual coupon code.", variant: "destructive" });
        return;
    }
    
    setAppliedPromotions(prev => [...prev, promo]);
    setCouponInput('');
    toast({ title: "Coupon Applied!", description: `"${promo.code}" was successfully applied.` });
  };
  
  const handleRemoveCoupon = (promoId: string) => {
    const promoToRemove = appliedPromotions.find(p => p.id === promoId);
    if (!promoToRemove) return;
    
    setAppliedPromotions(prev => prev.filter(p => p.id !== promoId));
    toast({ title: "Coupon Removed", description: `"${promoToRemove.code}" has been removed.`, variant: "destructive" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };
  
  const total = subtotal - discountAmount;
  const canProceed = isConfirmed && agreedToTerms;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
            <Tag className="text-muted-foreground" />
            <Input placeholder="Enter coupon code" value={couponInput} onChange={e => setCouponInput(e.target.value)} />
            <Button variant="secondary" onClick={handleApplyCoupon} disabled={!couponInput || isApplying}>
                {isApplying ? <Loader2 className="animate-spin"/> : 'Apply'}
            </Button>
        </div>
        {appliedPromotions.length > 0 && (
            <div className="space-y-1 pl-7">
                {appliedPromotions.map(p => (
                    <div key={p.id} className="flex items-center justify-between text-xs p-1 bg-green-100 dark:bg-green-900/50 rounded-md">
                        <span className="font-semibold text-green-700 dark:text-green-300">{p.code}</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => handleRemoveCoupon(p.id)}><X className="h-3 w-3"/></Button>
                    </div>
                ))}
            </div>
        )}
        <Separator />
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
         {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(discountAmount)}</span>
            </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-muted-foreground">Calculated at next step</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Taxes</span>
          <span className="text-muted-foreground">Calculated at next step</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Estimated Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 items-start">
         <div className="flex items-center space-x-2">
            <Checkbox id="design-confirm" checked={isConfirmed} onCheckedChange={(checked) => setIsConfirmed(!!checked)} />
            <Label htmlFor="design-confirm" className="text-sm font-normal">I confirm my corporate branding & design is correct.</Label>
         </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms-confirm" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(!!checked)} />
            <div className="text-sm">
                 <Label htmlFor="terms-confirm" className="font-normal">
                    I agree to the{' '}
                    <Link href="/legal/terms" className="underline hover:text-primary" target="_blank">
                        Terms & Conditions
                    </Link>
                    .
                </Label>
            </div>
         </div>
         <p className="text-xs text-muted-foreground">
            Once an order is confirmed, it cannot be cancelled. For more details, please refer to our <Link href="/legal/terms" className="underline hover:text-primary" target="_blank">Terms & Conditions</Link>.
         </p>
        <Button className="w-full" size="lg" asChild disabled={!canProceed}>
            <Link href="/corporate/checkout">Proceed to Checkout</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
