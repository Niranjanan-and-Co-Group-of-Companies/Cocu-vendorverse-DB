
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface MultiImageUploadProps {
  existingImageUrls?: string[];
  files: File[];
  onFilesChange: (files: File[]) => void;
  className?: string;
  maxFiles?: number;
}

export function MultiImageUpload({
  existingImageUrls = [],
  files,
  onFilesChange,
  className,
  maxFiles = 5,
}: MultiImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    if (files.length + newFiles.length + existingImageUrls.length > maxFiles) {
      toast({
        title: 'Upload Limit Exceeded',
        description: `You can only upload a maximum of ${maxFiles} images.`,
        variant: 'destructive',
      });
      return;
    }
    onFilesChange([...files, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };
  
  const handleRemoveExistingUrl = (url: string) => {
    // This is tricky as we can't remove the file, only the URL.
    // A more robust implementation might involve a callback to update the parent's URL list.
    // For now, this action is disabled in the UI.
    console.warn("Cannot remove already uploaded images from this component.");
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {existingImageUrls.map((url, index) => (
            <div key={`existing-${index}`} className="relative group aspect-square rounded-md overflow-hidden">
                <Image src={url} alt={`Existing image ${index + 1}`} fill className="object-cover" />
                 <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        // This should ideally trigger a callback to the parent to remove the URL
                        // For now we toast a message.
                        toast({ title: 'Info', description: 'To remove an uploaded image, save the product and edit again.' });
                    }}
                 >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        ))}
        {files.map((file, index) => (
          <div key={index} className="relative group aspect-square rounded-md overflow-hidden">
            <Image
              src={URL.createObjectURL(file)}
              alt={`Preview ${index + 1}`}
              fill
              className="object-cover"
              onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => {e.stopPropagation(); handleRemoveFile(index)}}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {files.length + existingImageUrls.length < maxFiles && (
          <div
            className="aspect-square rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center text-muted-foreground">
              <Upload className="mx-auto h-8 w-8" />
              <p className="mt-2 text-xs">Add Images</p>
            </div>
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
