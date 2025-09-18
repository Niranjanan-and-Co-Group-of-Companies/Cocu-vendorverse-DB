

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
import type { AllowedCustomizationType } from '@/lib/products';

const ALL_TYPES: AllowedCustomizationType[] = ['Text', 'AI Image', 'Image Upload', 'QR Code', 'Clipart'];

interface AllowedCustomizationsCardProps {
  allowedTypes: AllowedCustomizationType[];
  onAllowedCustomizationChange: (types: AllowedCustomizationType[]) => void;
  isReviewMode?: boolean;
}

export function AllowedCustomizationsCard({ allowedTypes, onAllowedCustomizationChange, isReviewMode = false }: AllowedCustomizationsCardProps) {
  const [pendingType, setPendingType] = React.useState<AllowedCustomizationType | null>(null);

  const handleCheckedChange = (type: AllowedCustomizationType, checked: boolean) => {
    if (isReviewMode) return;
    if (checked) {
      setPendingType(type);
    } else {
      onAllowedCustomizationChange(allowedTypes.filter(t => t !== type));
    }
  };

  const handleConfirm = () => {
    if (pendingType) {
      onAllowedCustomizationChange([...allowedTypes, pendingType]);
      setPendingType(null);
    }
  };

  return (
    <>
        <Card>
        <CardHeader>
            <CardTitle>Allowed Customizations</CardTitle>
            <CardDescription>Select which tools customers can use to personalize this item.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            {ALL_TYPES.map(type => (
                <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                        id={`custom-type-${type}`}
                        checked={allowedTypes.includes(type)}
                        onCheckedChange={(checked) => handleCheckedChange(type, !!checked)}
                        disabled={isReviewMode}
                    />
                    <Label htmlFor={`custom-type-${type}`} className="font-normal">{type}</Label>
                </div>
            ))}
        </CardContent>
        </Card>

        <AlertDialog open={!!pendingType} onOpenChange={() => setPendingType(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Enable "{pendingType}" Customization?</AlertDialogTitle>
                    <AlertDialogDescription>
                        By enabling this option, you agree to fulfill orders that include customizations made with the "{pendingType}" tool. Please ensure you have the capability to handle these requests.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm}>Enable</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}

    
