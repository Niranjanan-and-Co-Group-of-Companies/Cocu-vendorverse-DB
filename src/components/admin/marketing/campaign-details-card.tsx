
'use client';

import * as React from 'react';
import type { Campaign, Placement } from '@/lib/marketing-service';
import type { Platform } from '@/lib/products';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';


interface CampaignDetailsCardProps {
  campaign: Campaign;
  onFieldChange: (field: keyof Campaign, value: any) => void;
}

export function CampaignDetailsCard({ campaign, onFieldChange }: CampaignDetailsCardProps) {
  
  const handleDateChange = (field: 'startDate' | 'endDate', date?: Date) => {
    if (date) {
        onFieldChange(field, date);
    }
  }

  const placementOptions: { value: Placement; label: string }[] = [
    { value: 'homepage-hero', label: 'Homepage Hero Carousel' },
    { value: 'top-banner', label: 'Top Announcement Banner' },
    { value: 'popup-modal', label: 'Popup Modal' },
    { value: 'category-banner', label: 'Category Page Banner' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Details</CardTitle>
        <CardDescription>Set the core settings for your campaign.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input 
                    id="campaign-name" 
                    placeholder="e.g., Summer Sale" 
                    value={campaign.name}
                    onChange={(e) => onFieldChange('name', e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="campaign-type">Campaign Type</Label>
                <Select value={campaign.type} onValueChange={(value) => onFieldChange('type', value)}>
                    <SelectTrigger id="campaign-type">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Sale">Sale</SelectItem>
                        <SelectItem value="Promotion">Promotion</SelectItem>
                        <SelectItem value="Flash Sale">Flash Sale</SelectItem>
                        <SelectItem value="Content">Content/Announcement</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select value={campaign.platform} onValueChange={(value: Platform | 'Both') => onFieldChange('platform', value)}>
                    <SelectTrigger id="platform">
                        <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Personalized">Personalized</SelectItem>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="audience">Audience Targeting</Label>
                 <Select value={campaign.audience} onValueChange={(value) => onFieldChange('audience', value)} disabled>
                    <SelectTrigger id="audience">
                        <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Visitors</SelectItem>
                        <SelectItem value="New Customers">New Customers</SelectItem>
                        <SelectItem value="Returning Customers">Returning Customers</SelectItem>
                         <SelectItem value="Corporate">Corporate</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>


         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Start Date</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !campaign.startDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {campaign.startDate ? format(campaign.startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={campaign.startDate}
                            onSelect={(date) => handleDateChange('startDate', date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
             <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !campaign.endDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {campaign.endDate ? format(campaign.endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={campaign.endDate}
                            onSelect={(date) => handleDateChange('endDate', date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="placement">Creative Placement</Label>
            <Select value={campaign.placement} onValueChange={(value: Placement) => onFieldChange('placement', value)}>
                <SelectTrigger id="placement">
                    <SelectValue placeholder="Select where this appears" />
                </SelectTrigger>
                <SelectContent>
                    {placementOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        
         <div className="space-y-2">
            <Label htmlFor="description">Internal Description (Optional)</Label>
            <Textarea
                id="description"
                placeholder="Briefly describe the goal of this campaign for your team."
                value={campaign.description}
                onChange={(e) => onFieldChange('description', e.target.value)}
                rows={3}
            />
        </div>
      </CardContent>
    </Card>
  );
}
