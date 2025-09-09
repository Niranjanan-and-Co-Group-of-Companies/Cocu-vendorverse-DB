
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { FeaturedProduct } from '@/lib/featured-service';
import { toggleFeaturedPlatform, removeFeatured } from '@/lib/featured-service';

interface FeaturedProductListProps {
  products: FeaturedProduct[];
}

export function FeaturedProductList({ products }: FeaturedProductListProps) {
  const [productToRemove, setProductToRemove] = React.useState<FeaturedProduct | null>(null);
  const { toast } = useToast();

  const handleToggle = async (productId: string, platform: 'personal' | 'corporate') => {
    try {
      await toggleFeaturedPlatform(productId, platform);
      toast({
        title: 'Visibility Updated',
        description: `Product's featured status has been updated.`,
      });
    } catch (error) {
      console.error('Failed to toggle feature status:', error);
      toast({ title: 'Error', description: 'Could not update the product.', variant: 'destructive' });
    }
  };

  const handleRemove = async () => {
    if (!productToRemove) return;
    try {
      await removeFeatured(productToRemove.id);
      toast({
        title: 'Product Un-featured',
        description: `"${productToRemove.name}" is no longer featured.`,
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Failed to remove featured product:', error);
      toast({ title: 'Error', description: 'Could not un-feature the product.', variant: 'destructive' });
    }
    setProductToRemove(null);
  };

  if (products.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-64 flex items-center justify-center">
        <p className="text-muted-foreground">No products are currently featured. Add one to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-0">
          <div className="divide-y">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="rounded-md object-cover"
                  />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`personal-${product.id}`}
                      checked={product.featuredOnPersonal}
                      onCheckedChange={() => handleToggle(product.id, 'personal')}
                      disabled={product.platform === 'Corporate'}
                    />
                    <Label htmlFor={`personal-${product.id}`} className="text-sm">Personal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`corporate-${product.id}`}
                      checked={product.featuredOnCorporate}
                      onCheckedChange={() => handleToggle(product.id, 'corporate')}
                      disabled={product.platform === 'Personalized'}
                    />
                    <Label htmlFor={`corporate-${product.id}`} className="text-sm">Corporate</Label>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setProductToRemove(product)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AlertDialog open={!!productToRemove} onOpenChange={(isOpen) => !isOpen && setProductToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{productToRemove?.name}" from the featured list on all platforms. It will not delete the product itself.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleRemove}
            >
              Un-feature
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
