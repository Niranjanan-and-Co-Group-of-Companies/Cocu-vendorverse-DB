

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
  isReviewMode?: boolean;
}

export function MultiImageUpload({
  existingImageUrls = [],
  files,
  onFilesChange,
  className,
  maxFiles = 5,
  isReviewMode = false,
}: MultiImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReviewMode) return;
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
    if (isReviewMode) return;
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const allImageSources = [
      ...existingImageUrls.map(url => ({ type: 'url', src: url })),
      ...files.map(file => ({ type: 'file', src: URL.createObjectURL(file), fileObject: file }))
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {allImageSources.map((image, index) => (
            <div key={`image-${index}`} className="relative group aspect-square rounded-md overflow-hidden">
                <Image src={image.src} alt={`Image ${index + 1}`} fill className="object-cover" />
                {!isReviewMode && (
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (image.type === 'file') {
                                handleRemoveFile(files.indexOf(image.fileObject));
                            } else {
                                toast({ title: 'Info', description: 'To remove an uploaded image, save the product and edit again.' });
                            }
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        ))}
        {!isReviewMode && allImageSources.length < maxFiles && (
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
      {!isReviewMode && (
        <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
        />
      )}
    </div>
  );
}
