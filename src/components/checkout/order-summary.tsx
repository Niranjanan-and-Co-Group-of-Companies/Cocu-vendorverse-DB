
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart, type CartItem } from '@/hooks/use-cart';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Tag, X, Plus, Minus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPromotionsForProduct, getPromotionByCode } from '@/lib/promotions-actions';
import type { PlainPromotion } from '@/lib/promotions-service';
import Link from 'next/link';
import { Badge } from '../ui/badge';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
}

export function OrderSummary() {
  const { items, removeItem, updateQuantity } = useCart();
  const { toast } = useToast();
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [couponInput, setCouponInput] = React.useState('');
  const [appliedPromotions, setAppliedPromotions] = React.useState<PlainPromotion[]>([]);
  const [isApplying, setIsApplying] = React.useState(false);
  
  const subtotal = React.useMemo(() => {
    return items.reduce((total, item) => {
      const price = item.displayPrice?.finalPrice || parseFloat(item.price.replace('$', ''));
      return total + price * item.quantity;
    }, 0);
  }, [items]);

  React.useEffect(() => {
    const findAndApplyBestPromotion = async () => {
        if (items.length === 0) {
            setAppliedPromotions([]);
            return;
        }

        let allEligiblePromos: PlainPromotion[] = [];
        for (const item of items) {
            const promos = await getPromotionsForProduct(item.id, item.category || '', item.vendorId);
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

  const handleRemove = (cartItemId: string, name: string) => {
    removeItem(cartItemId);
    toast({
        title: "Item Removed",
        description: `"${name}" has been removed from your cart.`,
        variant: "destructive"
    })
  }
  
  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setIsApplying(true);
    const promo = await getPromotionByCode(couponInput);
    setIsApplying(false);

    if (!promo) {
        toast({ title: "Invalid Coupon", description: "The coupon code you entered is not valid or has expired.", variant: "destructive" });
        return;
    }

    if (appliedPromotions.some(p => p.id === promo.id)) {
        toast({ title: "Coupon Already Applied", variant: "destructive" });
        return;
    }
    
    // Check if the entered coupon is a visible/automatic one.
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

  const shippingFee = (subtotal - discountAmount > 500) ? 0 : 49;
  const convenienceFee = (subtotal - discountAmount) * 0.03;
  const total = subtotal - discountAmount + convenienceFee + shippingFee;
  
  const canPlaceOrder = isConfirmed && agreedToTerms;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-48 pr-4">
            <div className="space-y-4">
                {items.map(item => {
                  const price = item.displayPrice?.finalPrice || parseFloat(item.price.replace('$', ''));
                  const originalPrice = item.displayPrice?.originalPrice || price;
                  const itemHasDiscount = item.displayPrice?.hasDiscount || false;
                  const maxQty = item.maxQuantityPerOrder || item.stock;
                  return (
                    <div key={item.cartItemId} className="flex items-start gap-4">
                        <div className="relative shrink-0">
                            <Image src={item.selectedVariant?.image || item.image} alt={item.name} width={64} height={64} className="rounded-md aspect-square object-cover" />
                        </div>
                        <div className="flex-grow overflow-hidden">
                            <p className="font-semibold truncate">{item.name}</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-sm font-semibold">{formatCurrency(price)}</p>
                                {itemHasDiscount && (
                                    <p className="text-xs text-muted-foreground line-through">{formatCurrency(originalPrice)}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                             <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} disabled={item.quantity <= 1}><Minus className="h-3 w-3"/></Button>
                                <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} disabled={item.quantity >= maxQty}><Plus className="h-3 w-3"/></Button>
                            </div>
                             <p className="font-semibold text-sm mt-1">{formatCurrency(price * item.quantity)}</p>
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemove(item.cartItemId, item.name)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )})}
            </div>
        </ScrollArea>
        <Separator />
        <div className="space-y-2">
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
        </div>
        <Separator />
        <div className="space-y-2 text-sm">
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
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'Free' : formatCurrency(shippingFee)}</span>
            </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">Convenience Fee (3%)</span>
                <span className="text-muted-foreground">{formatCurrency(convenienceFee)}</span>
            </div>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 items-start">
         <div className="flex items-center space-x-2">
            <Checkbox id="design-confirm" checked={isConfirmed} onCheckedChange={(checked) => setIsConfirmed(!!checked)} />
            <Label htmlFor="design-confirm" className="text-sm font-normal">I confirm my personalization design is correct.</Label>
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
        <Button className="w-full" size="lg" disabled={!canPlaceOrder}>
          Place Order & Pay
        </Button>
      </CardFooter>
    </Card>
  );
}
