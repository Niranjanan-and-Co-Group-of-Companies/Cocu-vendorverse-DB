
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { savePromotion, type Promotion, type PromotionPlatform, type PromotionType, type PromotionScope } from '@/lib/promotions-service';
import { Calendar as CalendarIcon, Loader2, RefreshCw } from 'lucide-react';
import { format, toDate } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

interface PromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion: Promotion | null;
}

const getInitialFormData = (promotion: Promotion | null): Partial<Promotion> => {
    if (promotion) {
        return {
            ...promotion,
            expiresAt: promotion.expiresAt?.toDate ? promotion.expiresAt.toDate() : undefined,
        };
    }
    return {
        code: '',
        type: 'Percentage',
        value: 10,
        platform: 'Both',
        status: 'Active',
        scope: 'All Products',
        usageLimit: null,
        expiresAt: undefined,
        maxDiscount: null,
    };
};

export function PromotionDialog({ open, onOpenChange, promotion }: PromotionDialogProps) {
  const [formData, setFormData] = React.useState<Partial<Promotion>>(getInitialFormData(promotion));
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (open) {
      setFormData(getInitialFormData(promotion));
    }
  }, [promotion, open]);

  const handleChange = (field: keyof Promotion, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateCode = () => {
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    handleChange('code', newCode);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.type || !formData.value) {
        toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: 'destructive' });
        return;
    }
    setIsSaving(true);
    
    const dataToSave: Partial<Promotion> = { ...formData };
    if (dataToSave.usageLimit === '') dataToSave.usageLimit = null;
    if (dataToSave.maxDiscount === '') dataToSave.maxDiscount = null;
    if (dataToSave.expiresAt) {
        dataToSave.expiresAt = Timestamp.fromDate(new Date(dataToSave.expiresAt));
    }


    try {
        await savePromotion(dataToSave);
        toast({ title: "Promotion Saved", description: `"${formData.code}" has been successfully saved.` });
        onOpenChange(false);
    } catch (error) {
        console.error("Failed to save promotion:", error);
        toast({ title: "Error", description: "Could not save the promotion.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{promotion ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-2">
                <div className="space-y-2">
                    <Label htmlFor="code">Coupon Code</Label>
                    <Input id="code" value={formData.code || ''} onChange={e => handleChange('code', e.target.value.toUpperCase())} />
                </div>
                <Button variant="outline" type="button" onClick={handleGenerateCode}><RefreshCw className="mr-2" /> Generate</Button>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select value={formData.platform} onValueChange={(value: PromotionPlatform) => handleChange('platform', value)}>
                    <SelectTrigger id="platform"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Both">All Platforms</SelectItem>
                        <SelectItem value="Personalized">Personalized Only</SelectItem>
                        <SelectItem value="Corporate">Corporate Only</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Discount Type</Label>
                    <Select value={formData.type} onValueChange={(value: PromotionType) => handleChange('type', value)}>
                        <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Percentage">Percentage (%)</SelectItem>
                            <SelectItem value="Fixed Amount">Fixed Amount ($)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input id="value" type="number" value={formData.value || ''} onChange={e => handleChange('value', parseFloat(e.target.value) || 0)} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="maxDiscount">Max Discount (Optional)</Label>
                <Input id="maxDiscount" type="number" value={formData.maxDiscount || ''} onChange={e => handleChange('maxDiscount', e.target.value ? parseInt(e.target.value, 10) : null)} placeholder="e.g. 100" />
            </div>

            <div className="space-y-2">
                <Label>Coupon Scope</Label>
                <RadioGroup value={formData.scope} onValueChange={(value: PromotionScope) => handleChange('scope', value)} className="flex flex-col sm:flex-row gap-4">
                     <Label className="flex items-center gap-2 p-3 border rounded-md has-[:checked]:bg-accent has-[:checked]:border-primary flex-1 cursor-pointer">
                        <RadioGroupItem value="All Products" id="all-products" />
                        All Products
                    </Label>
                     <Label className="flex items-center gap-2 p-3 border rounded-md has-[:checked]:bg-accent has-[:checked]:border-primary flex-1 cursor-pointer">
                        <RadioGroupItem value="Specific Categories" id="specific-categories" />
                        Specific Categories
                    </Label>
                     <Label className="flex items-center gap-2 p-3 border rounded-md has-[:checked]:bg-accent has-[:checked]:border-primary flex-1 cursor-pointer">
                        <RadioGroupItem value="Specific Products" id="specific-products" />
                        Specific Products
                    </Label>
                </RadioGroup>
            </div>

             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2" />
                                {formData.expiresAt ? format(toDate(formData.expiresAt as any), "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.expiresAt ? toDate(formData.expiresAt as any) : undefined} onSelect={(date) => handleChange('expiresAt', date)} initialFocus /></PopoverContent>
                    </Popover>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="usageLimit">Usage Limit</Label>
                    <Input id="usageLimit" type="number" value={formData.usageLimit || ''} onChange={e => handleChange('usageLimit', e.target.value ? parseInt(e.target.value, 10) : null)} placeholder="Unlimited" />
                </div>
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Coupon'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
