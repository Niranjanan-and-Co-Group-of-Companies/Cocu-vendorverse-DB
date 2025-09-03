
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import type { Product, TieredPrice } from '@/lib/products';

interface B2BPricingCardProps {
  product: Product;
  onFieldChange: (field: keyof Product, value: any) => void;
}

export function B2BPricingCard({ product, onFieldChange }: B2BPricingCardProps) {

    const handleTierChange = (index: number, field: keyof TieredPrice, value: string | number) => {
        const newTiers = [...(product.tieredPricing || [])];
        newTiers[index] = { ...newTiers[index], [field]: value };
        onFieldChange('tieredPricing', newTiers);
    };

    const addTier = () => {
        const lastTierQty = product.tieredPricing && product.tieredPricing.length > 0 ? product.tieredPricing[product.tieredPricing.length - 1].quantity : (product.moq || 1);
        const newTiers = [...(product.tieredPricing || []), { quantity: lastTierQty + 50, price: '' }];
        onFieldChange('tieredPricing', newTiers);
    };

    const removeTier = (index: number) => {
        const newTiers = (product.tieredPricing || []).filter((_, i) => i !== index);
        onFieldChange('tieredPricing', newTiers);
    }


  return (
    <Card>
      <CardHeader>
        <CardTitle>B2B Pricing &amp; Inventory</CardTitle>
        <CardDescription>Set the base price, Minimum Order Quantity (MOQ), and volume-based pricing tiers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="price">Base Price (for a single item)</Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="price" type="number" value={product.price} onChange={e => onFieldChange('price', e.target.value)} className="pl-7"/>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="moq">Minimum Order Quantity (MOQ)</Label>
                <Input id="moq" type="number" value={product.moq} onChange={e => onFieldChange('moq', parseInt(e.target.value, 10))} />
            </div>
        </div>
        <div className="space-y-2">
            <Label>Tiered Pricing (Optional)</Label>
            <div className="space-y-2">
                {(product.tieredPricing || []).map((tier, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input type="number" placeholder="Quantity" value={tier.quantity} onChange={(e) => handleTierChange(index, 'quantity', parseInt(e.target.value, 10) || 0)} />
                        <div className="relative flex-grow">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                             <Input type="text" placeholder="Price per item" value={tier.price} onChange={(e) => handleTierChange(index, 'price', e.target.value)} className="pl-7"/>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeTier(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                    </div>
                ))}
            </div>
            <Button variant="outline" size="sm" onClick={addTier}><Plus className="mr-2"/> Add Price Tier</Button>
        </div>
      </CardContent>
    </Card>
  );
}
