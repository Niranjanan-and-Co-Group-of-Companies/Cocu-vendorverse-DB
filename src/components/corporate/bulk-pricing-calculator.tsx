
'use client';

import * as React from 'react';
import type { Product, TieredPrice } from '@/lib/products';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateDisplayPrice, type DisplayPrice } from '@/lib/pricing-service';
import { getCategoryByName } from '@/lib/categories-service';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';

interface BulkPricingCalculatorProps {
  product: Product;
  onPriceChange: (details: { unitPrice: number; total: number; quantity: number, displayPrice: DisplayPrice | null }) => void;
}

interface TierWithPrice extends TieredPrice {
    displayPrice: DisplayPrice;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

export function BulkPricingCalculator({ product, onPriceChange }: BulkPricingCalculatorProps) {
  const [quantity, setQuantity] = React.useState(product.moq || 1);
  const [pricedTiers, setPricedTiers] = React.useState<TierWithPrice[]>([]);
  const [loadingTiers, setLoadingTiers] = React.useState(true);
  const [currentDisplayPrice, setCurrentDisplayPrice] = React.useState<DisplayPrice | null>(null);

  React.useEffect(() => {
    const fetchTierPrices = async () => {
        if (!product.tieredPricing || product.tieredPricing.length === 0) {
            setLoadingTiers(false);
            return;
        }
        setLoadingTiers(true);
        const category = await getCategoryByName(product.category);
        const pricedTiersData = await Promise.all(
            product.tieredPricing.map(async tier => {
                 const displayPrice = await calculateDisplayPrice({ ...product, vendorSP: parseFloat(tier.price) }, 'Corporate', category || undefined, tier.quantity);
                 return { ...tier, displayPrice };
            })
        );
        setPricedTiers(pricedTiersData.sort((a,b) => a.quantity - b.quantity));
        setLoadingTiers(false);
    }
    fetchTierPrices();
  }, [product]);

  React.useEffect(() => {
    const calculateCurrentPrice = async () => {
        const category = await getCategoryByName(product.category);
        
        let vendorSP = product.vendorSP;
        if (product.tieredPricing && product.tieredPricing.length > 0) {
            const sortedTiers = [...product.tieredPricing].sort((a, b) => b.quantity - a.quantity);
            const applicableTier = sortedTiers.find(tier => quantity >= tier.quantity);
            if (applicableTier && applicableTier.price) {
                vendorSP = parseFloat(applicableTier.price.replace('$', '').replace('₹', ''));
            }
        }
        
        const displayPrice = await calculateDisplayPrice({ ...product, vendorSP }, 'Corporate', category || undefined, quantity);
        setCurrentDisplayPrice(displayPrice);

        const total = displayPrice.finalPrice * quantity;
        onPriceChange({
            unitPrice: displayPrice.finalPrice,
            total: total,
            quantity: quantity,
            displayPrice: displayPrice
        });
    };

    if (quantity >= (product.moq || 1)) {
        calculateCurrentPrice();
    } else if (quantity !== 0) {
        setCurrentDisplayPrice(null);
        onPriceChange({ unitPrice: 0, total: 0, quantity, displayPrice: null });
    }

  }, [quantity, product, onPriceChange]);


  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(isNaN(value) ? 0 : value);
  };
  
  const handleTierChange = (tierQuantity: string) => {
    const qty = parseInt(tierQuantity, 10);
    if (!isNaN(qty)) {
      setQuantity(qty);
    }
  }

  return (
    <div className="rounded-lg border p-4 space-y-4 bg-muted/20">
        <h4 className="font-semibold">Bulk Pricing Calculator</h4>
        {pricedTiers.length > 0 && (
             <div className="space-y-2">
                <Label htmlFor="quantity-tier">Select Quantity Tier</Label>
                 <Select onValueChange={handleTierChange} value={String(quantity)}>
                    <SelectTrigger id="quantity-tier">
                        <SelectValue placeholder="Select a tier" />
                    </SelectTrigger>
                    <SelectContent>
                        {loadingTiers ? <SelectItem value="loading" disabled>Loading tiers...</SelectItem> : 
                        pricedTiers.map((tier) => (
                        <SelectItem key={tier.quantity} value={String(tier.quantity)}>
                            <div className="flex justify-between items-center w-full">
                                <span>{tier.quantity}+ units</span>
                                <div className="flex items-center gap-2">
                                     {tier.displayPrice.hasDiscount && <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-4 leading-4">{tier.displayPrice.discountText}</Badge>}
                                    <span className="font-semibold">{formatCurrency(tier.displayPrice.finalPrice)}/unit</span>
                                </div>
                            </div>
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )}
        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="quantity">Enter Custom Quantity</Label>
                <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min={product.moq || 1}
                    placeholder={`e.g., ${product.moq}`}
                />
                 {product.moq && <p className="text-xs text-muted-foreground">MOQ: {product.moq}</p>}
            </div>
            <div className="space-y-2">
                <Label>Your Price / Unit</Label>
                 <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold">
                    {currentDisplayPrice ? (
                        <div className="flex items-center gap-2">
                            {currentDisplayPrice.hasDiscount && <span className="text-xs text-muted-foreground line-through">{formatCurrency(currentDisplayPrice.originalPrice)}</span>}
                            <span>{formatCurrency(currentDisplayPrice.finalPrice)}</span>
                        </div>
                    ) : (
                         <span>-</span>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
