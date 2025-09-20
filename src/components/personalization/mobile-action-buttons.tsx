
'use client';

import * as React from 'react';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useCustomization } from '@/hooks/use-customization';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { saveCustomizationProof, type CustomizationProof } from '@/lib/customization-service';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileActionButtonsProps {
  product: Product;
  isMobile?: boolean;
}

export function MobileActionButtons({ product, isMobile = false }: MobileActionButtonsProps) {
  const { elements, selectedVariantId, getCanvasDataURLs } = useCustomization();
  const { addItem: addToCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleAddToCart = async (andBuyNow: boolean = false) => {
    setIsProcessing(true);
    try {
        const customizedSides = [...new Set(elements.map(e => e.side))];
        const customizationProofs: CustomizationProof[] = [];
        
        const selectedVariant = product.variants.find(v => v.id === selectedVariantId);

        for (const side of customizedSides) {
            const urls = await getCanvasDataURLs(side);
            if(urls.proofUrl && urls.printUrl) {
                const { proofUrl, printUrl } = await saveCustomizationProof(product.id, side, urls.proofUrl, urls.printUrl);
                customizationProofs.push({
                    side,
                    proofUrl,
                    printUrl,
                });
            }
        }
        
        const result = await addToCart(product, 1, selectedVariant || null, customizationProofs);

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
    <div className={cn("space-y-2", isMobile && "space-y-0 flex gap-2")}>
        <div className={cn(!isMobile && "space-y-2")}>
            <h3 className={cn("font-semibold mb-3", isMobile && "hidden")}>Total Price</h3>
            <p className={cn("text-3xl font-bold", isMobile && "hidden")}>{product.price}</p>
        </div>
        <div className={cn("mt-4 space-y-2", isMobile && "mt-0 flex-grow grid grid-cols-2 gap-2")}>
            <Button className="w-full" onClick={() => handleAddToCart(false)} disabled={isProcessing} size={isMobile ? 'sm' : 'default'}>
               {isProcessing && <Loader2 className="mr-2 animate-spin" />}
               Add to Cart
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => handleAddToCart(true)} disabled={isProcessing} size={isMobile ? 'sm' : 'default'}>
               {isProcessing && <Loader2 className="mr-2 animate-spin" />}
               Buy Now
            </Button>
        </div>
    </div>
  );
}
