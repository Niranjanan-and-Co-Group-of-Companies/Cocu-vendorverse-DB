

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
import { Tag, X, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPromotionsForProduct } from '@/lib/promotions-actions';
import type { PlainPromotion } from '@/lib/promotions-service';

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
  const [couponCode, setCouponCode] = React.useState('');
  const [appliedPromotion, setAppliedPromotion] = React.useState<PlainPromotion | null>(null);

  const subtotal = React.useMemo(() => {
    return items.reduce((total, item) => {
      const price = item.displayPrice?.finalPrice || parseFloat(item.price.replace('$', ''));
      return total + price * item.quantity;
    }, 0);
  }, [items]);
  
  React.useEffect(() => {
    const findAndApplyBestPromotion = async () => {
        if (items.length === 0) {
            setAppliedPromotion(null);
            setCouponCode('');
            return;
        }

        let bestPromo: PlainPromotion | null = null;
        let maxDiscount = 0;

        for (const item of items) {
            const promos = await getPromotionsForProduct(item.id, item.category || '', item.vendorId);
            const itemPrice = (item.displayPrice?.originalPrice || parseFloat(item.price.replace('$', ''))) * item.quantity;

            for (const promo of promos) {
                if (promo.type === 'Free Shipping' || !promo.visibleOnPlatform) continue;

                let currentDiscount = 0;
                if (promo.type === 'Percentage') {
                    currentDiscount = itemPrice * (promo.value / 100);
                } else if (promo.type === 'Fixed Amount') {
                    currentDiscount = promo.value;
                }

                if (currentDiscount > maxDiscount) {
                    maxDiscount = currentDiscount;
                    bestPromo = promo;
                }
            }
        }
        
        if (bestPromo) {
            setAppliedPromotion(bestPromo);
            setCouponCode(bestPromo.code);
        } else {
            setAppliedPromotion(null);
            setCouponCode('');
        }
    };

    findAndApplyBestPromotion();
  }, [items]);
  
  const discountAmount = React.useMemo(() => {
    if (!appliedPromotion) return 0;
    
    if (appliedPromotion.type === 'Percentage') {
        return subtotal * (appliedPromotion.value / 100);
    }
    if (appliedPromotion.type === 'Fixed Amount') {
        return Math.min(appliedPromotion.value, subtotal);
    }
    return 0;
  }, [appliedPromotion, subtotal]);


  const handleRemove = (cartItemId: string, name: string) => {
    removeItem(cartItemId);
    toast({
        title: "Item Removed",
        description: `"${name}" has been removed from your cart.`,
        variant: "destructive"
    })
  }

  const convenienceFee = subtotal * 0.03;
  const shippingFee = (appliedPromotion?.type === 'Free Shipping' || (subtotal - discountAmount > 500)) ? 0 : 49;
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
                  const maxQty = item.maxQuantityPerOrder || item.stock;
                  return (
                    <div key={item.cartItemId} className="flex items-start gap-4">
                        <Image src={item.selectedVariant?.image || item.image} alt={item.name} width={64} height={64} className="rounded-md aspect-square object-cover" />
                        <div className="flex-grow overflow-hidden">
                            <p className="font-semibold truncate">{item.name}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} disabled={item.quantity <= 1}><Minus className="h-3 w-3"/></Button>
                                <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} disabled={item.quantity >= maxQty}><Plus className="h-3 w-3"/></Button>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                             <p className="font-semibold">{formatCurrency(price * item.quantity)}</p>
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemove(item.cartItemId, item.name)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )})}
            </div>
        </ScrollArea>
        <Separator />
        <div className="flex items-center gap-2">
            <Tag className="text-muted-foreground" />
            <Input placeholder="Enter coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
            <Button variant="secondary" disabled={!couponCode}>Apply</Button>
        </div>
        <Separator />
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromotion?.code})</span>
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
            <Label htmlFor="terms-confirm" className="text-sm font-normal">I agree to the Terms & Conditions.</Label>
         </div>
        <Button className="w-full" size="lg" disabled={!canPlaceOrder}>
          Place Order & Pay
        </Button>
      </CardFooter>
    </Card>
  );
}
