
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PlayCircle } from 'lucide-react';

interface ProductMediaGalleryProps {
  name: string;
  mainImage: string;
  galleryImages?: string[];
  videoUrl?: string;
}

export function ProductMediaGallery({ name, mainImage, galleryImages = [], videoUrl }: ProductMediaGalleryProps) {
    const media = [
        { type: 'image', url: mainImage },
        ...galleryImages.map(url => ({ type: 'image' as const, url })),
        ...(videoUrl ? [{ type: 'video' as const, url: videoUrl }] : []),
    ];

    const [activeMedia, setActiveMedia] = React.useState(media[0]);

    const getYouTubeThumbnail = (url: string) => {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
    };

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
