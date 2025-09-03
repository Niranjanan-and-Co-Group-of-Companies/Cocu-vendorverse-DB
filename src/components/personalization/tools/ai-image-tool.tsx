
'use client';

import * as React from 'react';
import { useCustomization } from '@/hooks/use-customization';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

const STYLE_PRESETS = ['Minimalist', 'Cartoon', 'Photorealistic', 'Abstract'];

export function AiImageTool() {
  const { addElement } = useCustomization();
  const [prompt, setPrompt] = React.useState('');
  const [selectedStyle, setSelectedStyle] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Prompt is required', description: 'Please describe the image you want to generate.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateImage({ prompt, style: selectedStyle || undefined });
      
      addElement({
        type: 'ai-image',
        x: 50,
        y: 50,
        width: 250, // Default size for new images
        height: 250,
        rotation: 0,
        opacity: 1,
        locked: false,
        src: result.imageUrl,
      });

      toast({ title: 'Image Generated!', description: 'Your new image has been added to the canvas.' });

    } catch (error) {
      console.error('Failed to generate image:', error);
      toast({ title: 'Generation Failed', description: 'Could not generate the image. Please try again.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <Label htmlFor="ai-prompt">Image Prompt</Label>
        <Textarea
          id="ai-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., watercolor roses with pastel background"
          rows={3}
          disabled={isGenerating}
        />
      </div>

      <div>
        <Label>Style Presets (Optional)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {STYLE_PRESETS.map(style => (
            <Button
              key={style}
              variant="outline"
              size="sm"
              onClick={() => setSelectedStyle(current => current === style ? null : style)}
              className={cn(selectedStyle === style && 'bg-accent')}
              disabled={isGenerating}
            >
              {style}
            </Button>
          ))}
        </div>
      </div>

      <Button onClick={handleGenerate} className="w-full" disabled={isGenerating}>
        {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
        {isGenerating ? 'Generating...' : 'Generate Image'}
      </Button>

      <Alert>
          <AlertDescription className="text-xs text-muted-foreground">
            AI-generated art may vary in style and is subject to vendor approval on the final product.
          </AlertDescription>
      </Alert>
    </div>
  );
}
