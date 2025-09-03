
'use client';

import * as React from 'react';
import type { Product, TieredPrice } from '@/lib/products';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BulkPricingCalculatorProps {
  product: Product;
  onPriceChange: (details: { unit: string; total: number; quantity: number }) => void;
}

export function BulkPricingCalculator({ product, onPriceChange }: BulkPricingCalculatorProps) {
  const [quantity, setQuantity] = React.useState(product.moq || 1);

  const getPriceForQuantity = (qty: number): string => {
    if (!product.tieredPricing || product.tieredPricing.length === 0) {
      return product.price;
    }

    let applicableTier: TieredPrice | undefined;
    const sortedTiers = [...product.tieredPricing].sort((a, b) => b.quantity - a.quantity);
    
    for (const tier of sortedTiers) {
      if (qty >= tier.quantity) {
        applicableTier = tier;
        break;
      }
    }

    return applicableTier ? applicableTier.price : product.price;
  };
  
  React.useEffect(() => {
    const unitPriceString = getPriceForQuantity(quantity);
    const unitPriceNumber = parseFloat(unitPriceString.replace('$', ''));
    const total = isNaN(unitPriceNumber) ? 0 : unitPriceNumber * quantity;

    onPriceChange({
        unit: unitPriceString,
        total: total,
        quantity: quantity
    });

  }, [quantity, product.tieredPricing, product.price, onPriceChange]);

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
  
  const sortedTiers = product.tieredPricing ? [...product.tieredPricing].sort((a, b) => a.quantity - b.quantity) : [];

  return (
    <div className="rounded-lg border p-4 space-y-4 bg-muted/20">
        <h4 className="font-semibold">Bulk Pricing Calculator</h4>
        {sortedTiers.length > 0 && (
             <div className="space-y-2">
                <Label htmlFor="quantity-tier">Select Quantity Tier</Label>
                 <Select onValueChange={handleTierChange}>
                    <SelectTrigger id="quantity-tier">
                        <SelectValue placeholder="Select a tier" />
                    </SelectTrigger>
                    <SelectContent>
                        {sortedTiers.map((tier) => (
                        <SelectItem key={tier.quantity} value={String(tier.quantity)}>
                            {tier.quantity}+ units ({tier.price}/unit)
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )}
        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="quantity">Enter Quantity</Label>
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
                <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {getPriceForQuantity(quantity)}
                </div>
            </div>
        </div>
    </div>
  );
}
