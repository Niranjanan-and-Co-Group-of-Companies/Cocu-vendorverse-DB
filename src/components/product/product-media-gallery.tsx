
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PlayCircle } from 'lucide-react';
import type { ProductVariant } from '@/lib/products';

type MediaItem = {
    type: 'image' | 'video';
    url: string;
};

interface ProductMediaGalleryProps {
  name: string;
  galleryImages?: string[];
  videoUrl?: string;
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
}

export function ProductMediaGallery({ name, galleryImages = [], videoUrl, variants, selectedVariant }: ProductMediaGalleryProps) {
    const [activeMedia, setActiveMedia] = React.useState<MediaItem | null>(null);

    const media: MediaItem[] = React.useMemo(() => {
        if (!variants || variants.length === 0) return []; // Guard against undefined or empty variants
        const currentVariant = selectedVariant || variants[0];
        if (!currentVariant) return [];
        
        const variantImages = [
            currentVariant.image,
            ...Object.values(currentVariant.customizationSides).map(s => s.image)
        ].filter(Boolean) as string[];

        const allImages = [...new Set([...variantImages, ...galleryImages])];

        const mediaItems = allImages.map(url => ({ type: 'image' as const, url }));
        if (videoUrl) {
            mediaItems.push({ type: 'video' as const, url: videoUrl });
        }
        return mediaItems;
    }, [selectedVariant, variants, galleryImages, videoUrl]);
    
    React.useEffect(() => {
        if (media.length > 0) {
            setActiveMedia(media[0]);
        }
    }, [media]);

    const getYouTubeThumbnail = (url: string) => {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
    };

    if (!activeMedia) {
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
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="aspect-square relative flex items-center justify-center">
                        {activeMedia.type === 'image' ? (
                            <Image
                                src={activeMedia.url}
                                alt={name}
                                fill
                                className="object-cover"
                                data-ai-hint="product image"
                            />
                        ) : (
                             <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${activeMedia.url.split('v=')[1]?.split('&')[0]}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        )}
                    </div>
                </CardContent>
            </Card>
            <div className="grid grid-cols-5 gap-4">
                {media.map((item, index) => (
                    <div
                        key={index}
                        className={cn(
                            'aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-colors',
                            activeMedia.url === item.url ? 'border-primary' : 'border-transparent hover:border-primary/50'
                        )}
                        onClick={() => setActiveMedia(item)}
                    >
                        <div className="relative w-full h-full">
                             <Image
                                src={item.type === 'image' ? item.url : getYouTubeThumbnail(item.url)}
                                alt={`${name} thumbnail ${index + 1}`}
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
