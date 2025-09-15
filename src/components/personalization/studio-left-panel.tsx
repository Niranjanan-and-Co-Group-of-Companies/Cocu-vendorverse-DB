
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SideSelector } from './side-selector';
import { VariantSelector } from './variant-selector';
import { useCustomization } from '@/hooks/use-customization';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { saveCustomizationProof, type CustomizationProof } from '@/lib/customization-service';
import { Loader2 } from 'lucide-react';

interface StudioLeftPanelProps {
  product: Product;
}

export function StudioLeftPanel({ product }: StudioLeftPanelProps) {
  const { elements, selectedVariantId, getCanvasDataURL } = useCustomization();
  const { addItem: addToCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const showVariants = product.hasVariants && product.variants && product.variants.length > 1;

  const handleAddToCart = async (andBuyNow: boolean = false) => {
    setIsProcessing(true);
    try {
        const customizedSides = [...new Set(elements.map(e => e.side))];
        const customizationProofs: CustomizationProof[] = [];

        for (const side of customizedSides) {
            const dataUrl = getCanvasDataURL(side);
            if(dataUrl) {
                const proofUrl = await saveCustomizationProof(product.id, side, dataUrl);
                customizationProofs.push({
                    side,
                    proofUrl,
                    printUrl: proofUrl, // In a real app, this would be a different, high-res file
                });
            }
        }
        
        const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || null;

        const result = await addToCart(product, 1, selectedVariant, customizationProofs);

        toast({
            title: result.success ? (andBuyNow ? 'Proceeding to Checkout' : 'Added to Cart') : 'Could Not Add to Cart',
            description: result.message,
            variant: result.success ? 'default' : 'destructive',
        });

        if (result.success && andBuyNow) {
            router.push('/checkout');
        }

    } catch (error) {
        console.error("Failed to add to cart:", error);
        toast({ title: 'Error', description: 'Could not save your design or add to cart.', variant: 'destructive' });
    } finally {
        setIsProcessing(false);
    }
  };


  return (
    <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
            <div>
                <h2 className="text-lg font-bold">{product.name}</h2>
                <p className="text-sm text-muted-foreground">by {product.vendor}</p>
            </div>
            
            <Separator />
            
            {showVariants && (
              <>
                <VariantSelector product={product} />
                <Separator />
              </>
            )}

            <SideSelector product={product} />

            <Separator />

            <div>
                <h3 className="font-semibold mb-3">Total Price</h3>
                <p className="text-3xl font-bold">{product.price}</p>
                 <div className="mt-4 space-y-2">
                    <Button className="w-full" onClick={() => handleAddToCart(false)} disabled={isProcessing}>
                       {isProcessing && <Loader2 className="mr-2 animate-spin" />}
                       Add to Cart
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={() => handleAddToCart(true)} disabled={isProcessing}>
                       {isProcessing && <Loader2 className="mr-2 animate-spin" />}
                       Buy Now
                    </Button>
                 </div>
            </div>
        </div>
    </ScrollArea>
  );
}
