

'use client';

import * as React from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  imageUrl?: string;
  onFileSelect: (file: File | null) => void;
  className?: string;
  isReviewMode?: boolean;
}

export function ImageUpload({ imageUrl, onFileSelect, className, isReviewMode = false }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(imageUrl || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPreviewUrl(imageUrl || null);
  }, [imageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReviewMode) return;
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    if (isReviewMode) return;
    e.stopPropagation();
    onFileSelect(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={cn(
        "w-full aspect-video rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center relative group",
        !isReviewMode && "cursor-pointer hover:border-primary transition-colors",
        className
      )}
      onClick={() => !isReviewMode && fileInputRef.current?.click()}
    >
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" disabled={isReviewMode} />
      
      {previewUrl ? (
        <>
            <Image src={previewUrl} alt="Creative preview" fill className="object-cover rounded-md" />
            {!isReviewMode && (
                <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemoveImage}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </>
      ) : (
        <div className="text-center text-muted-foreground">
          <Upload className="mx-auto h-8 w-8" />
          <p className="mt-2 text-sm">{isReviewMode ? "No Image Provided" : "Click to upload"}</p>
        </div>
      )}
    </div>
  );
}
