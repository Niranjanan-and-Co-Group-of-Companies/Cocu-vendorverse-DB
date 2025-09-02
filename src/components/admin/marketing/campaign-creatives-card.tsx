
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { GripVertical, Plus, Trash2, Video, Image as ImageIcon } from 'lucide-react';
import type { CampaignCreative } from '@/app/admin/marketing/new/page';
import { ImageUpload } from '@/components/common/image-upload';

interface CampaignCreativesCardProps {
  creatives: CampaignCreative[];
  onCreativeChange: (creative: CampaignCreative) => void;
  onAddCreative: () => void;
  onRemoveCreative: (id: string) => void;
}

function CreativeForm({ creative, onCreativeChange, onRemoveCreative }: { creative: CampaignCreative, onCreativeChange: (creative: CampaignCreative) => void, onRemoveCreative: (id: string) => void }) {
    const [mediaType, setMediaType] = React.useState<'image' | 'video'>(creative.videoUrl ? 'video' : 'image');

    const handleFieldChange = (field: keyof CampaignCreative, value: any) => {
        onCreativeChange({ ...creative, [field]: value });
    };

    const handleMediaTypeChange = (type: 'image' | 'video') => {
        setMediaType(type);
        if (type === 'image') {
            handleFieldChange('videoUrl', '');
        } else {
            handleFieldChange('imageUrl', '');
            handleFieldChange('imageFile', null);
        }
    }

    return (
        <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor={`title-${creative.id}`}>Title</Label>
                    <Input id={`title-${creative.id}`} value={creative.title} onChange={e => handleFieldChange('title', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`cta-text-${creative.id}`}>CTA Button Text</Label>
                    <Input id={`cta-text-${creative.id}`} value={creative.ctaText} onChange={e => handleFieldChange('ctaText', e.target.value)} />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor={`description-${creative.id}`}>Description</Label>
                <Textarea id={`description-${creative.id}`} value={creative.description} onChange={e => handleFieldChange('description', e.target.value)} rows={3} />
            </div>
             <div className="space-y-2">
                <Label htmlFor={`cta-link-${creative.id}`}>CTA Button Link</Label>
                <Input id={`cta-link-${creative.id}`} value={creative.ctaLink} onChange={e => handleFieldChange('ctaLink', e.target.value)} placeholder="e.g., /products/sale" />
            </div>

             <div className="space-y-2">
                <Label>Media Type</Label>
                <div className="flex gap-2">
                    <Button variant={mediaType === 'image' ? 'secondary' : 'outline'} size="sm" onClick={() => handleMediaTypeChange('image')}>
                        <ImageIcon className="mr-2" /> Image
                    </Button>
                    <Button variant={mediaType === 'video' ? 'secondary' : 'outline'} size="sm" onClick={() => handleMediaTypeChange('video')}>
                        <Video className="mr-2" /> Video
                    </Button>
                </div>
            </div>

            {mediaType === 'image' ? (
                 <div className="space-y-2">
                    <Label>Creative Image</Label>
                    <ImageUpload 
                        imageUrl={creative.imageUrl}
                        onFileSelect={(file) => handleFieldChange('imageFile', file)}
                    />
                </div>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor={`video-url-${creative.id}`}>YouTube Video URL</Label>
                    <Input id={`video-url-${creative.id}`} value={creative.videoUrl} onChange={e => handleFieldChange('videoUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                </div>
            )}
            
            <div className="flex justify-end">
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onRemoveCreative(creative.id)}>
                    <Trash2 className="mr-2"/> Remove Creative
                </Button>
            </div>
        </div>
    );
}


export function CampaignCreativesCard({ creatives, onCreativeChange, onAddCreative, onRemoveCreative }: CampaignCreativesCardProps) {
  // If there are multiple creatives, keep them all open by default for easier editing.
  const defaultAccordionValue = creatives.map(c => c.id);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Creatives</CardTitle>
        <CardDescription>Design what customers will see. You can add multiple creatives which will display as a carousel.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {creatives.length > 0 ? (
             <Accordion type="multiple" defaultValue={defaultAccordionValue}>
                {creatives.map(creative => (
                    <AccordionItem key={creative.id} value={creative.id}>
                        <AccordionTrigger className="font-medium text-base hover:no-underline">
                           <div className="flex items-center gap-2">
                             <GripVertical className="h-5 w-5 text-muted-foreground" />
                             <span>{creative.title || "New Creative"}</span>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <CreativeForm creative={creative} onCreativeChange={onCreativeChange} onRemoveCreative={onRemoveCreative} />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        ): (
            <p className="text-sm text-muted-foreground text-center py-4">No creatives yet. Add one to get started.</p>
        )}
       
        <Button variant="outline" className="w-full" onClick={onAddCreative}>
            <Plus className="mr-2" />
            Add Another Creative
        </Button>
      </CardContent>
    </Card>
  );
}
