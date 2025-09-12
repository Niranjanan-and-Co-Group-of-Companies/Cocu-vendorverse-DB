
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PlayCircle } from 'lucide-react';
import type { Product, ProductVariant } from '@/lib/products';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

type MediaItem = {
    type: 'image' | 'video';
    url: string;
};

interface ProductMediaGalleryProps {
  product: Product;
  selectedVariant: ProductVariant | null;
}

export function ProductMediaGallery({ product, selectedVariant }: ProductMediaGalleryProps) {
    const [api, setApi] = React.useState<CarouselApi>()
    const [current, setCurrent] = React.useState(0)

    const media: MediaItem[] = React.useMemo(() => {
        const items: MediaItem[] = [];
        
        const mainImage = product.image;
        const galleryImages = product.galleryImages || [];
        const videoUrl = product.videoUrl;

        // Determine which variant's images to use
        const currentVariant = selectedVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : null);

        // Collect all unique image URLs
        const imageUrls = new Set<string>();

        if (currentVariant) {
            if (currentVariant.image) imageUrls.add(currentVariant.image);
            Object.values(currentVariant.customizationSides).forEach(side => {
                if (side.image) imageUrls.add(side.image);
            });
        }
        
        // Always include the main product image as a primary option if it exists
        if (mainImage) {
            imageUrls.add(mainImage);
        }

        galleryImages.forEach(url => imageUrls.add(url));

        imageUrls.forEach(url => items.push({ type: 'image', url }));

        if (videoUrl) {
            items.push({ type: 'video', url: videoUrl });
        }
        
        return items;
    }, [product, selectedVariant]);
    
     React.useEffect(() => {
        if (!api) {
            return
        }

        setCurrent(api.selectedScrollSnap())

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap())
        })
     }, [api])

    const getYouTubeThumbnail = (url: string) => {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
    };
    
    const handleThumbnailClick = (index: number) => {
        api?.scrollTo(index);
    }

    if (media.length === 0) {
        return (
            <Card className="overflow-hidden">
                <div className="aspect-square bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">No media available</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                    {media.map((item, index) => (
                        <CarouselItem key={index}>
                            <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="aspect-square relative flex items-center justify-center">
                                    {item.type === 'image' ? (
                                        <Image
                                            src={item.url}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            data-ai-hint="product image"
                                            priority={index === 0}
                                        />
                                    ) : (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${item.url.split('v=')[1]?.split('&')[0]}`}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    )}
                                    </div>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
            </Carousel>

            <div className="grid grid-cols-5 gap-4">
                {media.map((item, index) => (
                    <div
                        key={index}
                        className={cn(
                            'aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-colors',
                            current === index ? 'border-primary' : 'border-transparent hover:border-primary/50'
                        )}
                        onClick={() => handleThumbnailClick(index)}
                    >
                        <div className="relative w-full h-full">
                             <Image
                                src={item.type === 'image' ? item.url : getYouTubeThumbnail(item.url)}
                                alt={`${product.name} thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                            {item.type === 'video' && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <PlayCircle className="h-8 w-8 text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
