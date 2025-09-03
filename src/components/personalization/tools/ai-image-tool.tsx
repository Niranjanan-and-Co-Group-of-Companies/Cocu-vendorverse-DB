
'use client';

import * as React from 'react';
import { useCustomization } from '@/hooks/use-customization';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageUpload } from '@/components/common/image-upload';

export function AiImageTool() {
  const { addElement } = useCustomization();
  const [prompt, setPrompt] = React.useState('');
  const [sourceImageFile, setSourceImageFile] = React.useState<File | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { toast } = useToast();

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Prompt is required', description: 'Please describe the image you want to generate.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    let sourceImageUrl: string | undefined = undefined;

    try {
        if(sourceImageFile) {
            sourceImageUrl = await fileToDataUri(sourceImageFile);
        }

      const result = await generateImage({ 
          prompt, 
          sourceImageUrl
      });
      
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
  
  const isGenerateDisabled = !prompt.trim() || isGenerating;

  return (
    <div className="p-4 space-y-4">
       <div>
        <Label>Source Image (Optional)</Label>
         <ImageUpload onFileSelect={setSourceImageFile} />
      </div>

      <div>
        <Label htmlFor="ai-prompt">Image Prompt</Label>
        <Textarea
          id="ai-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., make this a cartoon, add a floral background..."
          rows={3}
          disabled={isGenerating}
        />
      </div>

      <Button onClick={handleGenerate} className="w-full" disabled={isGenerateDisabled}>
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
