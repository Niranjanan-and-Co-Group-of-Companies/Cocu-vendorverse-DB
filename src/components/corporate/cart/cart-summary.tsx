
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { CartItem } from '@/hooks/use-corporate-cart';
import { Input } from '@/components/ui/input';
import { Tag, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPromotionByCode } from '@/lib/promotions-actions';
import type { PlainPromotion } from '@/lib/promotions-service';

interface CartSummaryProps {
  items: CartItem[];
}

export function CartSummary({ items }: CartSummaryProps) {
  const { toast } = useToast();
  const [couponInput, setCouponInput] = React.useState('');
  const [appliedPromotion, setAppliedPromotion] = React.useState<PlainPromotion | null>(null);
  const [isApplying, setIsApplying] = React.useState(false);

  const subtotal = React.useMemo(() => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.price.replace('$', '').replace('₹', ''));
      return total + price * item.quantity;
    }, 0);
  }, [items]);

  const discountAmount = React.useMemo(() => {
    if (!appliedPromotion) return 0;
    
    let discount = 0;
    if (appliedPromotion.type === 'Percentage') {
        discount = subtotal * (appliedPromotion.value / 100);
    } else if (appliedPromotion.type === 'Fixed Amount') {
        discount = Math.min(appliedPromotion.value, subtotal);
    }
    return discount;
  }, [appliedPromotion, subtotal]);

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setIsApplying(true);
    const promo = await getPromotionByCode(couponInput);
    setIsApplying(false);

    if (!promo || promo.platform === 'Personalized') {
        toast({ title: "Invalid Coupon", description: "This coupon is not valid for corporate orders.", variant: "destructive" });
        return;
    }

    if (appliedPromotion) {
        toast({ title: "Coupon Already Applied", description: "Only one coupon can be applied per order.", variant: "destructive" });
        return;
    }
    
    setAppliedPromotion(promo);
    setCouponInput('');
    toast({ title: "Coupon Applied!", description: `"${promo.code}" was successfully applied.` });
  };
  
  const handleRemoveCoupon = () => {
    if (appliedPromotion) {
      toast({ title: "Coupon Removed", description: `"${appliedPromotion.code}" has been removed.`, variant: "destructive" });
      setAppliedPromotion(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };
  
  const total = subtotal - discountAmount;

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
        {appliedPromotion && (
            <div className="space-y-1 pl-7">
                <div className="flex items-center justify-between text-xs p-1 bg-green-100 dark:bg-green-900/50 rounded-md">
                    <span className="font-semibold text-green-700 dark:text-green-300">{appliedPromotion.code}</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={handleRemoveCoupon}><X className="h-3 w-3"/></Button>
                </div>
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
      <CardFooter>
        <Button className="w-full" size="lg">
          Proceed to Checkout
        </Button>
      </CardFooter>
    </Card>
  );
}
