
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import type { CommissionRule, Override } from '@/lib/commissions-service';
import { updateCommissionRule } from '@/lib/commissions-service';

interface CommissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: CommissionRule | Override | null;
  type: 'category' | 'vendor' | 'product';
}

export function CommissionDialog({ open, onOpenChange, rule, type }: CommissionDialogProps) {
  const [commissionRate, setCommissionRate] = React.useState(0);
  const [bufferType, setBufferType] = React.useState<'fixed' | 'percentage'>('fixed');
  const [bufferValue, setBufferValue] = React.useState(0);
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  const isSunshineCategory = type === 'category' && 'categoryName' in (rule || {}) && (rule as CommissionRule).categoryName === 'Made by Sunshine';


  React.useEffect(() => {
    if (rule) {
      setCommissionRate(rule.commissionRate);
      setBufferType(rule.bufferType);
      setBufferValue(rule.bufferValue);
    } else {
      setCommissionRate(0);
      setBufferType('fixed');
      setBufferValue(0);
    }
  }, [rule, open]);

  const handleSave = async () => {
    if (!rule) return;
    setIsSaving(true);
    try {
      const finalCommissionRate = isSunshineCategory ? 0 : commissionRate;
      await updateCommissionRule(type, rule.id, {
        commissionRate: finalCommissionRate,
        bufferType,
        bufferValue,
      });
      toast({ title: "Commission Rule Updated", description: `The rule for "${'name' in rule ? rule.name : (rule as CommissionRule).categoryName}" has been updated.` });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save commission rule:", error);
      toast({ title: "Error", description: "Failed to save rule.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const getTitle = () => {
    if (!rule) return '';
    const name = 'name' in rule ? rule.name : (rule as CommissionRule).categoryName;
    return `Edit Commission: ${name}`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Set the commission rate and pricing buffer for this item.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            {/* Commission Rate */}
            <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="commission-rate" className="text-right">Commission Rate</Label>
                <div className="col-span-2 relative">
                    <Input 
                        id="commission-rate" 
                        type="number" 
                        value={isSunshineCategory ? 0 : commissionRate} 
                        onChange={(e) => setCommissionRate(parseFloat(e.target.value))} 
                        className="pr-8"
                        disabled={isSunshineCategory}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                 {isSunshineCategory && (
                    <p className="col-span-3 text-xs text-muted-foreground text-center">
                        Commission for "Made by Sunshine" is locked at 0%.
                    </p>
                )}
            </div>

            {/* Buffer */}
            <div className="grid grid-cols-3 items-start gap-4">
                <Label className="text-right pt-2">Pricing Buffer</Label>
                <div className="col-span-2 space-y-3">
                    <RadioGroup value={bufferType} onValueChange={(value) => setBufferType(value as any)} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fixed" id="fixed" />
                            <Label htmlFor="fixed">Fixed (₹)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="percentage" id="percentage" />
                            <Label htmlFor="percentage">Percentage (%)</Label>
                        </div>
                    </RadioGroup>

                    <div className="relative">
                       <Input 
                            id="buffer-value" 
                            type="number" 
                            value={bufferValue}
                            onChange={(e) => setBufferValue(parseFloat(e.target.value))}
                            className="pr-8"
                        />
                         <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {bufferType === 'fixed' ? '₹' : '%'}
                         </span>
                    </div>
                </div>
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
