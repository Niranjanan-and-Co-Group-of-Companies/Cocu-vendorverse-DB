
'use client';

import * as React from 'react';
import { useCustomization } from '@/hooks/use-customization';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function UploadTool() {
  const { addElement } = useCustomization();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast({ title: 'Invalid File Type', description: 'Please upload an image file (PNG, JPG, etc.).', variant: 'destructive' });
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (src) {
        addElement({
          type: 'image',
          x: 50,
          y: 50,
          width: 250,
          height: 250,
          rotation: 0,
          opacity: 1,
          locked: false,
          src,
        });
        toast({ title: 'Image Uploaded', description: 'Your image has been added to the canvas.' });
      }
    };
    reader.readAsDataURL(file);

    // Reset the input value so the same file can be uploaded again
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg"
      />
      <Button onClick={handleUploadClick} className="w-full">
        <Upload className="mr-2" />
        Upload Your Image
      </Button>
      
      <Alert>
        <AlertTitle>Copyright Notice</AlertTitle>
        <AlertDescription className="text-xs">
          By uploading an image, you represent that you have the legal right to use it. You are responsible for any copyright infringement.
        </AlertDescription>
      </Alert>
    </div>
  );
}
