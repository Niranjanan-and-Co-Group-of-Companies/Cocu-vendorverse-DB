
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
import { savePromotion, type Promotion, type PromotionType, type PromotionStatus, type PromotionPlatform } from '@/lib/promotions-service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion: Promotion | null;
}

const createDefaultPromotion = (): Partial<Promotion> => ({
    code: '',
    description: '',
    type: 'Percentage',
    value: 10,
    platform: 'Personalized',
    status: 'Inactive',
    usageLimit: 100,
    usageCount: 0,
    conditions: [],
});

export function PromotionDialog({ open, onOpenChange, promotion }: PromotionDialogProps) {
  const [promoData, setPromoData] = React.useState<Partial<Promotion>>(createDefaultPromotion());
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (open) {
        if (promotion) {
            setPromoData({
                ...promotion,
                expiresAt: promotion.expiresAt?.toDate ? promotion.expiresAt.toDate() : undefined,
            });
        } else {
            setPromoData(createDefaultPromotion());
        }
    }
  }, [promotion, open]);

  const handleFieldChange = (field: keyof Promotion, value: any) => {
    setPromoData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSave = async () => {
    if (!promoData.code || !promoData.type) {
        toast({ title: "Code and Type are required.", variant: 'destructive' });
        return;
    }
    setIsSaving(true);
    try {
        await savePromotion(promoData);
        toast({ title: `Promotion ${promotion ? 'Updated' : 'Created'}`, description: `Coupon "${promoData.code}" has been saved.` });
        onOpenChange(false);
    } catch(error) {
        toast({ title: 'Error', description: 'Failed to save promotion.', variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{promotion ? 'Edit Promotion' : 'Create New Promotion'}</DialogTitle>
          <DialogDescription>
            Fill in the details for the promotional coupon code.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="code">Coupon Code</Label>
                    <Input id="code" value={promoData.code || ''} onChange={e => handleFieldChange('code', e.target.value.toUpperCase())} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={promoData.type} onValueChange={(value: PromotionType) => handleFieldChange('type', value)}>
                        <SelectTrigger id="type"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Percentage">Percentage</SelectItem>
                            <SelectItem value="Fixed Amount">Fixed Amount</SelectItem>
                            <SelectItem value="Free Shipping">Free Shipping</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input id="value" type="number" value={promoData.value || 0} onChange={e => handleFieldChange('value', parseFloat(e.target.value) || 0)} disabled={promoData.type === 'Free Shipping'} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={promoData.description || ''} onChange={e => handleFieldChange('description', e.target.value)} placeholder="e.g., 10% off for new users" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select value={promoData.platform} onValueChange={(value: PromotionPlatform) => handleFieldChange('platform', value)}>
                        <SelectTrigger id="platform"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Personalized">Personalized</SelectItem>
                            <SelectItem value="Corporate">Corporate</SelectItem>
                            <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={promoData.status} onValueChange={(value: PromotionStatus) => handleFieldChange('status', value)}>
                        <SelectTrigger id="status"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="usageLimit">Usage Limit</Label>
                    <Input id="usageLimit" type="number" value={promoData.usageLimit || 0} onChange={e => handleFieldChange('usageLimit', parseInt(e.target.value, 10))} />
                </div>
                <div className="space-y-2">
                    <Label>Expiry Date (Optional)</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !promoData.expiresAt && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {promoData.expiresAt ? format(new Date(promoData.expiresAt), "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={promoData.expiresAt ? new Date(promoData.expiresAt) : undefined} onSelect={date => handleFieldChange('expiresAt', date)} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 animate-spin" /> : null}
                Save Promotion
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

