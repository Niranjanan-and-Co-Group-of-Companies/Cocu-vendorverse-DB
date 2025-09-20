
'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { CustomizationDetails } from '@/lib/orders-service';

interface CustomizationProofDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: { name: string; customizations: CustomizationDetails[] } | null;
}

export function CustomizationProofDialog({ isOpen, onOpenChange, item }: CustomizationProofDialogProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customization Proof for: {item.name}</DialogTitle>
          <DialogDescription>
            Review the final design for each customized side of the product.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {item.customizations.map((cust, index) => (
                <CarouselItem key={index}>
                    <div className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden">
                        <Image src={cust.proofUrl} alt={`Proof for ${cust.side} side`} fill className="object-contain" />
                        <Badge variant="secondary" className="absolute top-2 left-2 capitalize">{cust.side} Side</Badge>
                    </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {item.customizations.length > 1 && (
                <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                </>
            )}
          </Carousel>
           <div className="py-2 text-center text-sm text-muted-foreground">
             {count > 1 && `Side ${current} of ${count}`}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
