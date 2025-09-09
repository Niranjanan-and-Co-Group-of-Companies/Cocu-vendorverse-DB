
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
import { savePromotion, type Promotion, type PromotionType, type PromotionStatus, type PromotionPlatform, getTargetableItems, type TargetableItem } from '@/lib/promotions-service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, X, Sparkles } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

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
    visibleOnPlatform: false,
    appliesTo: { products: [], categories: [], vendors: [] }
});

function MultiSelect({ title, items, selectedItems, onSelectionChange }: { title: string, items: TargetableItem[], selectedItems: TargetableItem[], onSelectionChange: (newSelection: TargetableItem[]) => void }) {
    const [search, setSearch] = React.useState('');
    const selectedIds = new Set(selectedItems.map(i => i.id));
    
    const filteredItems = items
        .filter(item => item.name.toLowerCase().includes(search.toLowerCase()) && !selectedIds.has(item.id))
        .slice(0, 10);

    const handleSelect = (item: TargetableItem) => {
        onSelectionChange([...selectedItems, item]);
        setSearch('');
    };

    const handleRemove = (itemToRemove: TargetableItem) => {
        onSelectionChange(selectedItems.filter(item => item.id !== itemToRemove.id));
    };

    return (
        <div className="space-y-2">
            <Label>{title}</Label>
            <Input placeholder={`Search for a ${title.toLowerCase().slice(0, -1)}...`} value={search} onChange={e => setSearch(e.target.value)} />
             {search && filteredItems.length > 0 && (
                <ScrollArea className="h-32 border rounded-md">
                    {filteredItems.map(item => (
                        <div key={item.id} onClick={() => handleSelect(item)} className="p-2 cursor-pointer hover:bg-accent text-sm">{item.name}</div>
                    ))}
                </ScrollArea>
             )}
            <div className="flex flex-wrap gap-2">
                {selectedItems.map(item => (
                    <Badge key={item.id} variant="secondary">{item.name} <button onClick={() => handleRemove(item)} className="ml-2"><X className="h-3 w-3"/></button></Badge>
                ))}
            </div>
        </div>
    );
}

const DateTimePicker = ({ date, onDateChange }: { date?: Date, onDateChange: (date?: Date) => void }) => {
    const handleDateSelect = (selectedDate?: Date) => {
        if (!selectedDate) {
            onDateChange(undefined);
            return;
        }
        const newDate = new Date(date || new Date());
        newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        onDateChange(newDate);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [hours, minutes] = e.target.value.split(':').map(Number);
        const newDate = new Date(date || new Date());
        if (!isNaN(hours)) newDate.setHours(hours);
        if (!isNaN(minutes)) newDate.setMinutes(minutes);
        onDateChange(newDate);
    };
    
    return (
        <div className="flex gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-2/3 justify-start text-left font-normal", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
                </PopoverContent>
            </Popover>
            <Input
                type="time"
                value={date ? format(date, "HH:mm") : ''}
                onChange={handleTimeChange}
                className="w-1/3"
            />
        </div>
    )
}

export function PromotionDialog({ open, onOpenChange, promotion }: PromotionDialogProps) {
  const [promoData, setPromoData] = React.useState<Partial<Promotion>>(createDefaultPromotion());
  const [isSaving, setIsSaving] = React.useState(false);
  const [targetableItems, setTargetableItems] = React.useState<{ products: TargetableItem[], categories: TargetableItem[], vendors: TargetableItem[] }>({ products: [], categories: [], vendors: []});
  const { toast } = useToast();

  React.useEffect(() => {
    getTargetableItems().then(setTargetableItems);
  }, []);

  React.useEffect(() => {
    if (open) {
        if (promotion) {
            setPromoData({
                ...createDefaultPromotion(),
                ...promotion,
                startDate: promotion.startDate?.toDate ? promotion.startDate.toDate() : undefined,
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
  
  const handleAppliesToChange = (type: 'products' | 'categories' | 'vendors', value: TargetableItem[]) => {
      setPromoData(prev => ({ ...prev, appliesTo: { ...(prev.appliesTo || { products: [], categories: [], vendors: [] }), [type]: value } }));
  };

  const handleGenerateCode = () => {
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    handleFieldChange('code', newCode);
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{promotion ? 'Edit Promotion' : 'Create New Promotion'}</DialogTitle>
          <DialogDescription>
            Fill in the details for the promotional coupon code.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="pr-6 -mr-6">
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <div className="flex items-center gap-2">
                    <Input id="code" value={promoData.code || ''} onChange={e => handleFieldChange('code', e.target.value.toUpperCase())} className="flex-grow font-mono" />
                    <Button type="button" variant="outline" onClick={handleGenerateCode}>
                        <Sparkles className="mr-2 h-4 w-4" /> Generate
                    </Button>
                </div>
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
                    <Label htmlFor="startDate">Start Date & Time (Optional)</Label>
                    <DateTimePicker date={promoData.startDate} onDateChange={(date) => handleFieldChange('startDate', date)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="expiresAt">Expiry Date & Time (Optional)</Label>
                    <DateTimePicker date={promoData.expiresAt} onDateChange={(date) => handleFieldChange('expiresAt', date)} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit (0 for unlimited)</Label>
                <Input id="usageLimit" type="number" value={promoData.usageLimit || 0} onChange={e => handleFieldChange('usageLimit', parseInt(e.target.value, 10))} />
            </div>
            <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="visible" className="text-base">Visible on Platform</Label>
                    <Switch id="visible" checked={promoData.visibleOnPlatform} onCheckedChange={(checked) => handleFieldChange('visibleOnPlatform', checked)} />
                </div>
                <p className="text-sm text-muted-foreground">If enabled, this coupon will be automatically applied at checkout for eligible orders. Only one visible coupon can be active at a time.</p>
            </div>
             <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-medium">Targeting (Optional)</h4>
                <p className="text-sm text-muted-foreground">If no targets are selected, the coupon applies to the entire cart.</p>
                <MultiSelect title="Products" items={targetableItems.products} selectedItems={promoData.appliesTo?.products || []} onSelectionChange={(val) => handleAppliesToChange('products', val)} />
                <MultiSelect title="Categories" items={targetableItems.categories} selectedItems={promoData.appliesTo?.categories || []} onSelectionChange={(val) => handleAppliesToChange('categories', val)} />
                <MultiSelect title="Vendors" items={targetableItems.vendors} selectedItems={promoData.appliesTo?.vendors || []} onSelectionChange={(val) => handleAppliesToChange('vendors', val)} />
            </div>
        </div>
        </ScrollArea>
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
