
'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor } from 'lucide-react';
import type { Campaign } from '@/lib/marketing-service';
import Image from 'next/image';
import { YouTubeEmbed } from '@/components/common/youtube-embed';

interface CampaignPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign;
}

function PreviewContent({ campaign }: { campaign: Campaign }) {
    const creative = campaign.creatives?.[0];
    if (!creative) return <div className="text-center text-muted-foreground">No creative to preview.</div>;

    const localImageUrl = creative.imageFile ? URL.createObjectURL(creative.imageFile) : creative.imageUrl;

    const renderMedia = () => {
        if(creative.videoUrl) {
            return <YouTubeEmbed url={creative.videoUrl} />;
        }
        if(localImageUrl) {
            return <Image src={localImageUrl} alt={creative.title} layout="fill" objectFit="cover" />;
        }
        return null;
    }

    const renderPlacement = () => {
        const mediaContent = renderMedia();

        switch(campaign.placement) {
            case 'homepage-hero':
                return (
                     <section className="relative w-full h-full bg-muted flex items-center justify-center">
                        {mediaContent}
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="relative z-10 text-center text-white p-8">
                            <h1 className="text-4xl font-bold font-headline">{creative.title}</h1>
                            <p className="mt-4 text-lg max-w-2xl">{creative.description}</p>
                            <Button size="lg" className="mt-8">{creative.ctaText}</Button>
                        </div>
                    </section>
                );
            case 'top-banner':
                return (
                    <div className="w-full bg-primary text-primary-foreground p-3 text-center">
                        <p>{creative.description} <a href={creative.ctaLink} className="font-bold underline">{creative.ctaText}</a></p>
                    </div>
                );
            case 'popup-modal':
                 return (
                    <div className="w-full h-full bg-black/60 flex items-center justify-center">
                        <div className="bg-background rounded-lg shadow-2xl w-[400px] overflow-hidden">
                             {mediaContent && (
                                <div className="relative aspect-video">
                                     {mediaContent}
                                </div>
                             )}
                             <div className="p-6 text-center">
                                <h2 className="text-2xl font-bold font-headline">{creative.title}</h2>
                                <p className="mt-2 text-muted-foreground">{creative.description}</p>
                                <Button className="mt-6 w-full">{creative.ctaText}</Button>
                             </div>
                        </div>
                    </div>
                 );
            default:
                return (
                    <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
                        Preview not available for this placement type.
                    </div>
                )
        }
    }

    return (
        <div className="w-full h-[500px] bg-background rounded-lg overflow-hidden border">
           {renderPlacement()}
        </div>
    );
}

export function CampaignPreviewDialog({ open, onOpenChange, campaign }: CampaignPreviewDialogProps) {
  const [view, setView] = React.useState<'desktop' | 'mobile'>('desktop');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={view === 'desktop' ? 'sm:max-w-4xl' : 'sm:max-w-sm'}>
        <DialogHeader>
          <DialogTitle>Campaign Preview</DialogTitle>
          <DialogDescription>
            See how your campaign will appear to customers on different devices.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 mx-auto">
            <PreviewContent campaign={campaign} />
        </div>

        <DialogFooter className="sm:justify-center">
            <div className="flex items-center gap-2">
                <Button variant={view === 'mobile' ? 'default' : 'outline'} size="icon" onClick={() => setView('mobile')}>
                    <Smartphone />
                </Button>
                <Button variant={view === 'desktop' ? 'default' : 'outline'} size="icon" onClick={() => setView('desktop')}>
                    <Monitor />
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
