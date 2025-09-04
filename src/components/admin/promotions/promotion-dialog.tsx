
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
import { useToast } from '@/hooks/use-toast';
import { savePromotion, type Promotion, type PromotionPlatform, type PromotionType } from '@/lib/promotions-service';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format, toDate } from 'date-fns';

interface PromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion: Promotion | null;
}

export function PromotionDialog({ open, onOpenChange, promotion }: PromotionDialogProps) {
  const [formData, setFormData] = React.useState<Partial<Promotion>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (promotion) {
      setFormData({
        ...promotion,
        // Convert Firestore Timestamp to Date object for the calendar if it exists
        expiresAt: promotion.expiresAt?.toDate ? promotion.expiresAt.toDate() : undefined
      });
    } else {
      // Default values for a new promotion
      setFormData({
        code: '',
        type: 'Percentage',
        value: 10,
        platform: 'Both',
        status: 'Active',
        usageLimit: null,
        expiresAt: undefined,
      });
    }
  }, [promotion, open]);

  const handleChange = (field: keyof Promotion, value: string | number | null | PromotionPlatform | PromotionType) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.code || !formData.type || !formData.value) {
        toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: 'destructive' });
        return;
    }
    setIsSaving(true);
    try {
        await savePromotion(formData);
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{promotion ? 'Edit Promotion' : 'Create New Promotion'}</DialogTitle>
          <DialogDescription>
            Fill in the details for your discount or coupon code.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="code">Coupon Code</Label>
                    <Input id="code" value={formData.code || ''} onChange={e => handleChange('code', e.target.value.toUpperCase())} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select value={formData.platform} onValueChange={(value: PromotionPlatform) => handleChange('platform', value)}>
                        <SelectTrigger id="platform"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Both">Both</SelectItem>
                            <SelectItem value="Personalized">Personalized</SelectItem>
                            <SelectItem value="Corporate">Corporate</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
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
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
                    <Input id="usageLimit" type="number" value={formData.usageLimit || ''} onChange={e => handleChange('usageLimit', e.target.value ? parseInt(e.target.value, 10) : null)} placeholder="e.g. 1000" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2" />
                                {formData.expiresAt ? format(toDate(formData.expiresAt), "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.expiresAt ? toDate(formData.expiresAt) : undefined} onSelect={(date) => handleChange('expiresAt', date)} initialFocus /></PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Promotion'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
