
'use client';

import * as React from 'react';
import type { Product, ProductVariant } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, MessageSquare, Heart, Bell, Minus, Plus, Brush, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Label } from '../ui/label';
import { useWishlist } from '@/hooks/use-wishlist';
import Link from 'next/link';
import { getShippingEstimate } from '@/lib/shipping-service';
import { LoginDialog } from '../layout/login-dialog';

interface ProductInteractionsProps {
  product: Product;
  categoryName?: string;
  selectedVariant: ProductVariant | null;
}

export function ProductInteractions({ product, categoryName, selectedVariant }: ProductInteractionsProps) {
  const [pincode, setPincode] = React.useState('');
  const [deliveryInfo, setDeliveryInfo] = React.useState('');
  const [checking, setChecking] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);
  const [showMaxQuantityWarning, setShowMaxQuantityWarning] = React.useState(false);
  const { addItem } = useCart();
  const { addItem: toggleWishlistItem, isItemInWishlist } = useWishlist();
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = React.useState(null);
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  
  const maxQuantity = product.maxQuantityPerOrder || product.stock;
  const inWishlist = isItemInWishlist(product.id);

  React.useEffect(() => {
    const session = sessionStorage.getItem('user-auth');
    if (session) {
      setUser(JSON.parse(session));
    }
  }, []);

  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;

    if (newQuantity < 1) {
        setQuantity(1);
        return;
    }
    
    if (newQuantity > maxQuantity) {
      setQuantity(maxQuantity);
      setShowMaxQuantityWarning(true);
    } else {
      setQuantity(newQuantity);
      setShowMaxQuantityWarning(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
        setIsLoginOpen(true);
        return;
    }
    const result = await addItem(product, quantity, selectedVariant);
    toast({
      title: 'Added to Cart',
      description: result.message
    });
  };

  const handleBuyNow = async () => {
    if (!user) {
        setIsLoginOpen(true);
        return;
    }
    await addItem(product, quantity, selectedVariant);
    router.push('/checkout');
  };

  const handleWishlistToggle = async () => {
    if (!user) {
        setIsLoginOpen(true);
        return;
    }
    const result = await toggleWishlistItem(product);
    toast({
      title: result.message,
    });
  }


  const handleCheckDelivery = async () => {
    if (!pincode || pincode.length !== 6) {
        setDeliveryInfo("Please enter a valid 6-digit pincode.");
        return;
    };
    setChecking(true);
    try {
        const estimate = await getShippingEstimate(product.vendorId, product.preparationTime, product.preparationTimeUnit, pincode);
        setDeliveryInfo(estimate);
    } catch(error) {
        setDeliveryInfo("Could not calculate delivery time.");
    } finally {
        setChecking(false);
    }
  };
  
  const renderMainActions = () => {
    if (product.stock === 0) {
        return (
            <Button size="lg" className="w-full" disabled>
                <Bell className="mr-2" />
                Notify Me When Available
            </Button>
        );
    }
    if (product.customizable) {
        return (
            <div className="space-y-4">
                 <Button asChild size="lg" className="w-full">
                    <Link href={`/customize/${product.id}?variant=${selectedVariant?.id}`}>
                        <Brush className="mr-2" />
                        Customize Now
                    </Link>
                </Button>
                <div className="grid grid-cols-2 gap-3">
                    <Button size="lg" className="w-full" onClick={handleAddToCart}>
                        <ShoppingCart className="mr-2" />
                        Add to Cart
                    </Button>
                    <Button size="lg" variant="secondary" className="w-full" onClick={handleBuyNow}>
                        Buy Now
                    </Button>
                </div>
            </div>
        );
    }
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
            <Button size="lg" className="w-full" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2" />
              Add to Cart
            </Button>
            <Button size="lg" variant="secondary" className="w-full" onClick={handleBuyNow}>Buy Now</Button>
        </div>
      </div>
    );
  }


  return (
    <>
        <div className="space-y-6">
            {product.stock > 0 && !product.customizable && (
                <div className="space-y-2">
                    <Label>Quantity</Label>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Input 
                            type="text" 
                            readOnly 
                            value={quantity} 
                            className="w-16 text-center" 
                        />
                        <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)} disabled={quantity >= maxQuantity}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {showMaxQuantityWarning && (
                        <p className="text-sm text-destructive">Max. order quantity per order is {maxQuantity}.</p>
                    )}
                </div>
            )}

            {renderMainActions()}
            
            <div className="grid grid-cols-1 gap-3">
                <Button size="lg" variant="outline" className="w-full" onClick={handleWishlistToggle}>
                    <Heart className={inWishlist ? "mr-2 fill-red-500 text-red-500" : "mr-2"} />
                    {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </Button>
            </div>
            <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-semibold">Check Delivery</h4>
                <div className="flex gap-2">
                    <Input 
                        placeholder="Enter Pincode" 
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        maxLength={6}
                    />
                    <Button onClick={handleCheckDelivery} disabled={checking}>
                        {checking ? <Loader2 className="animate-spin" /> : 'Check'}
                    </Button>
                </div>
                {deliveryInfo && <p className="text-sm text-muted-foreground">{deliveryInfo}</p>}
            </div>
        </div>
        <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </>
  );
}
