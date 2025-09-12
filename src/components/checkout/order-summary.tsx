
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
import { Tag, X, Plus, Minus, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPromotionsForProduct, getPromotionByCode } from '@/lib/promotions-actions';
import type { PlainPromotion } from '@/lib/promotions-service';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { calculateCustomerShippingCost } from '@/lib/shipping-service';
import { onProductsUpdate, type Product } from '@/lib/products-client-service';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';
import { createOrder } from '@/lib/orders-service';
import { getMockUser } from '@/lib/user-service';
import type { User } from '@/lib/user-service';
import { makePlain } from '@/lib/utils';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
}

export function OrderSummary() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [couponInput, setCouponInput] = React.useState('');
  const [appliedPromotions, setAppliedPromotions] = React.useState<PlainPromotion[]>([]);
  const [isApplying, setIsApplying] = React.useState(false);
  const [shippingFee, setShippingFee] = React.useState(0);
  const [liveProductData, setLiveProductData] = React.useState<Map<string, Product>>(new Map());
  const [isCheckoutBlocked, setIsCheckoutBlocked] = React.useState(false);
  const [outOfStockItem, setOutOfStockItem] = React.useState<CartItem | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);

  // Real-time listener for product stock and price updates
  React.useEffect(() => {
    const productIds = items.map(item => item.id);
    if (productIds.length > 0) {
      const unsubscribe = onProductsUpdate(productIds, (updatedProducts) => {
        const productMap = new Map(updatedProducts.map(p => [p.id, p]));
        setLiveProductData(productMap);
        
        let blockCheckout = false;
        for (const item of items) {
          const liveProduct = productMap.get(item.id);
          if (liveProduct && liveProduct.stock < item.quantity) {
            blockCheckout = true;
            if (liveProduct.stock === 0) {
                setOutOfStockItem(item);
            }
          }
        }
        setIsCheckoutBlocked(blockCheckout);
      });
      return () => unsubscribe();
    } else {
        setLiveProductData(new Map());
        setIsCheckoutBlocked(false);
    }
  }, [items]);

  const handleRemove = (cartItemId: string, name: string) => {
    removeItem(cartItemId);
    toast({
        title: "Item Removed",
        description: `"${name}" has been removed from your cart.`,
        variant: "destructive"
    })
  }

  const subtotal = React.useMemo(() => {
    return items.reduce((total, item) => {
      const price = item.displayPrice?.finalPrice || parseFloat(item.price.replace('$', ''));
      return total + price * item.quantity;
    }, 0);
  }, [items]);
  
   const discountAmount = 0; // Simplified for this change
   const convenienceFee = (subtotal - discountAmount) * 0.03;
   const total = subtotal - discountAmount + convenienceFee + shippingFee;
  
  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
        const user: User | null = await getMockUser();
        if (!user) {
            toast({ title: "Please log in to place an order.", variant: "destructive" });
            setIsPlacingOrder(false);
            return;
        }
        
        const plainItems = makePlain(items);

        const orderData = {
            customer: {
                id: user.id,
                name: user.name,
                email: user.email,
                shippingAddress: "123 Maple St, Springfield, IL", // Mock Address
                pincode: '62704', // Mock Pincode
            },
            items: plainItems,
            subtotal,
            shipping: shippingFee,
            total,
            payment: {
                method: "Simulated Payment",
                status: "Paid" as const,
                transactionId: `sim_${Date.now()}`
            },
        };

        const result = await createOrder(orderData);

        if (result.success) {
            toast({ title: "Order Placed!", description: "Your order has been successfully placed." });
            clearCart();
            router.push('/checkout/success');
        } else {
            throw new Error("Order creation failed");
        }

    } catch (error) {
        console.error("Failed to place order:", error);
        toast({ title: "Error", description: "Could not place your order. Please try again.", variant: "destructive" });
    } finally {
        setIsPlacingOrder(false);
    }
  };

  const canPlaceOrder = isConfirmed && agreedToTerms && !isCheckoutBlocked && !isPlacingOrder;

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCheckoutBlocked && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>Some items are out of stock. Please remove them to proceed.</span>
            </div>
        )}
        <ScrollArea className="h-48 pr-4">
            <div className="space-y-4">
                {items.map(item => {
                  const liveProduct = liveProductData.get(item.id);
                  const isOutOfStock = liveProduct ? liveProduct.stock === 0 : false;
                  const hasInsufficientStock = liveProduct ? liveProduct.stock < item.quantity : false;
                  const isDisabled = isOutOfStock || hasInsufficientStock;

                  const price = item.displayPrice?.finalPrice || parseFloat(item.price.replace('$', ''));
                  const originalPrice = item.displayPrice?.originalPrice || price;
                  const itemHasDiscount = item.displayPrice?.hasDiscount || false;
                  
                  return (
                    <div key={item.cartItemId} className={cn("flex items-start gap-4", isDisabled && "opacity-50")}>
                        <div className="relative shrink-0">
                            <Image src={item.selectedVariant?.image || item.image} alt={item.name} width={64} height={64} className="rounded-md aspect-square object-cover" />
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-muted text-destructive hover:bg-destructive hover:text-destructive-foreground" 
                                onClick={() => handleRemove(item.cartItemId, item.name)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex-grow overflow-hidden">
                            <p className="font-semibold truncate">{item.name}</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-sm font-semibold">{formatCurrency(price)}</p>
                                {itemHasDiscount && (
                                    <p className="text-xs text-muted-foreground line-through">{formatCurrency(originalPrice)}</p>
                                )}
                            </div>
                            {isOutOfStock && <Badge variant="destructive" className="mt-1">Out of Stock</Badge>}
                            {hasInsufficientStock && !isOutOfStock && <Badge variant="secondary" className="mt-1">Only {liveProduct.stock} left</Badge>}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-medium w-4 text-center">x {item.quantity}</span>
                            </div>
                             <p className="font-semibold text-sm mt-1">{formatCurrency(price * item.quantity)}</p>
                        </div>
                    </div>
                )})}
            </div>
        </ScrollArea>
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
        <Button className="w-full" size="lg" disabled={!canPlaceOrder} onClick={handlePlaceOrder}>
          {isPlacingOrder ? <Loader2 className="mr-2 animate-spin" /> : null}
          {isPlacingOrder ? 'Placing Order...' : 'Place Order & Pay'}
        </Button>
      </CardFooter>
    </Card>

    <AlertDialog open={!!outOfStockItem} onOpenChange={() => setOutOfStockItem(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Item Out of Stock</AlertDialogTitle>
                <AlertDialogDescription>
                    Unfortunately, "{outOfStockItem?.name}" just went out of stock. Please remove it from your cart to proceed with your order.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => {
                    if(outOfStockItem) removeItem(outOfStockItem.cartItemId);
                    setOutOfStockItem(null);
                }}>
                    Remove Item & Continue
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
