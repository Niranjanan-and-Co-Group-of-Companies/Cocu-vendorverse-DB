

'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addCategory, updateCategory, type Category, type CategoryPlatform } from '@/lib/categories-service';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
  const [name, setName] = React.useState('');
  const [platform, setPlatform] = React.useState<CategoryPlatform>('Personalized');
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (category) {
      setName(category.name);
      setPlatform(category.platform || 'Personalized');
      setPreviewUrl(category.image || null);
    } else {
      setName('');
      setPlatform('Personalized');
      setPreviewUrl(null);
    }
    setImageFile(null); // Reset file on open/change
  }, [category, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleSave = async () => {
    if (!name) {
        toast({ title: "Name is required", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    try {
        if (category) { // Editing existing category
            await updateCategory(category.id, { name, platform, imageFile: imageFile || undefined });
            toast({ title: "Category Updated", description: `"${name}" has been updated.` });
        } else { // Creating new category
            await addCategory({ name, platform, imageFile: imageFile || undefined });
            toast({ title: "Category Created", description: `"${name}" has been created.` });
        }
        onOpenChange(false);
    } catch (error) {
        console.error("Failed to save category:", error);
        toast({ title: "Error", description: "Failed to save category.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Create New Category'}</DialogTitle>
          <DialogDescription>
            {category ? 'Update the details for this category.' : 'Enter the details for the new category.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g. Home & Decor" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="platform" className="text-right">Platform</Label>
            <Select value={platform} onValueChange={(value: CategoryPlatform) => setPlatform(value)}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select platform visibility" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Personalized">Personalized</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Image</Label>
            <div className="col-span-3">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              <div
                className="w-full aspect-video rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <Image src={previewUrl} alt="Category preview" width={200} height={112} className="object-cover rounded-md" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Upload className="mx-auto h-8 w-8" />
                    <p>Click to upload</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Category'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
