
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
import { getProductsByCategory } from '@/lib/categories-service';
import { getProductsByVendor } from '@/lib/products-service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, X, Sparkles, AlertCircle, Search, Image as ImageIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

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

const DateTimePicker = ({ date, onDateChange }: { date?: Date, onDateChange: (date?: Date) => void }) => {
    const handleDateSelect = (selectedDate?: Date) => {
        if (!selectedDate) {
            onDateChange(undefined);
            return;
        }
        selectedDate.setHours(0, 0, 0, 0); 
        onDateChange(selectedDate);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [hours, minutes] = e.target.value.split(':').map(Number);
        const newDate = new Date(date || new Date());
        newDate.setHours(hours || 0);
        newDate.setMinutes(minutes || 0);
        onDateChange(newDate);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDateChange(undefined);
    }
    
    return (
        <div className="flex gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal relative pr-8", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP HH:mm") : <span>Pick a date</span>}
                         {date && (
                             <div className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer" onClick={handleClear}>
                                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </div>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
                    <div className="p-3 border-t">
                        <Label>Time</Label>
                        <Input
                            type="time"
                            value={date ? format(date, "HH:mm") : ''}
                            onChange={handleTimeChange}
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

function SearchAndSelect({ title, items, onSelect }: { title: string, items: TargetableItem[], onSelect: (item: TargetableItem) => void }) {
    const [search, setSearch] = React.useState('');
    const filteredItems = search ? items.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5) : [];

    return (
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder={`Search for a ${title.toLowerCase()}...`}
                className="pl-8"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            {search && filteredItems.length > 0 && (
                <div className="absolute top-full mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md z-10">
                    {filteredItems.map(item => (
                        <div key={item.id} onClick={() => { onSelect(item); setSearch(''); }} className="p-2 cursor-pointer hover:bg-accent text-sm">
                            {item.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
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
                appliesTo: promotion.appliesTo || { products: [], categories: [], vendors: [] },
            });
        } else {
            setPromoData(createDefaultPromotion());
        }
    }
  }, [promotion, open]);

  const handleFieldChange = (field: keyof Promotion, value: any) => {
    setPromoData(prev => ({ ...prev, [field]: value }));
  };
  
 const addProductsToSelection = (productsToAdd: TargetableItem[]) => {
      setPromoData(prev => {
          const currentProducts = prev.appliesTo?.products || [];
          const currentProductIds = new Set(currentProducts.map(p => p.id));
          const newProducts = productsToAdd.filter(p => !currentProductIds.has(p.id));
          const updatedProducts = [...currentProducts, ...newProducts];
          
          return {
              ...prev,
              appliesTo: {
                  ...(prev.appliesTo || { products: [], categories: [], vendors: [] }),
                  products: updatedProducts,
              }
          };
      });
  };


  const handleSelect = async (type: 'product' | 'category' | 'vendor', item: TargetableItem) => {
    if (type === 'product') {
        addProductsToSelection([item]);
    } else if (type === 'category') {
        const products = await getProductsByCategory(item.id);
        addProductsToSelection(products.map(p => ({ id: p.id, name: p.name, image: p.image })));
    } else if (type === 'vendor') {
        const products = await getProductsByVendor(item.id);
        addProductsToSelection(products.map(p => ({ id: p.id, name: p.name, image: p.image })));
    }
  };
  
  const handleRemoveProduct = (productId: string) => {
    setPromoData(prev => {
        const updatedProducts = (prev.appliesTo?.products || []).filter(p => p.id !== productId);
        return {
            ...prev,
            appliesTo: {
                ...(prev.appliesTo || { products: [], categories: [], vendors: [] }),
                products: updatedProducts,
            }
        };
    });
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{promotion ? 'Edit Promotion' : 'Create New Promotion'}</DialogTitle>
          <DialogDescription>
            Fill in the details for the promotional coupon code.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="pr-6 -mr-6 flex-grow">
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
                <p className="text-sm text-muted-foreground">Search for products, categories, or vendors to apply this promotion to. If no targets are selected, it applies to the entire cart.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SearchAndSelect title="Products" items={targetableItems.products} onSelect={(item) => handleSelect('product', item)} />
                    <SearchAndSelect title="Categories" items={targetableItems.categories} onSelect={(item) => handleSelect('category', item)} />
                    <SearchAndSelect title="Vendors" items={targetableItems.vendors} onSelect={(item) => handleSelect('vendor', item)} />
                </div>
                
                <div>
                  <Label>Applied to Products</Label>
                  <div className="h-48 border rounded-md p-2 mt-2 overflow-y-auto">
                     {(promoData.appliesTo?.products || []).length > 0 ? (
                       <div className="space-y-2">
                         {(promoData.appliesTo?.products || []).map(p => (
                           <div key={p.id} className="flex items-center justify-between p-1 rounded-md hover:bg-muted">
                             <div className="flex items-center gap-2 overflow-hidden">
                               {p.image ? (
                                 <Image src={p.image} alt={p.name} width={24} height={24} className="rounded-sm object-cover" />
                               ) : (
                                 <ImageIcon className="h-6 w-6 text-muted-foreground" />
                               )}
                               <span className="text-sm truncate">{p.name}</span>
                             </div>
                             <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveProduct(p.id)}>
                               <X className="h-4 w-4 text-destructive"/>
                             </Button>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div className="flex items-center justify-center h-full">
                         <p className="text-sm text-muted-foreground">Applies to all products by default.</p>
                       </div>
                     )}
                   </div>
                </div>
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
