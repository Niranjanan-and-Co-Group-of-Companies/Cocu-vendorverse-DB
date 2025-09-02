
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface BidDetails {
    quantity: number;
    pincode: string;
    deliveryTimeline: string;
    biddingDuration: '24' | '48';
}

interface BidDetailsCardProps {
    details: BidDetails;
    onDetailsChange: (details: BidDetails) => void;
}

export function BidDetailsCard({ details, onDetailsChange }: BidDetailsCardProps) {

    const handleChange = (field: keyof BidDetails, value: string | number) => {
        onDetailsChange({ ...details, [field]: value });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Bid Details</CardTitle>
                <CardDescription>Specify the requirements for your bulk order.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity (for each item)</Label>
                        <Input 
                            id="quantity" 
                            type="number"
                            value={details.quantity}
                            onChange={e => handleChange('quantity', parseInt(e.target.value, 10) || 0)}
                            placeholder="e.g., 500"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pincode">Delivery Pincode</Label>
                        <Input 
                            id="pincode" 
                            value={details.pincode}
                            onChange={e => handleChange('pincode', e.target.value)}
                            placeholder="e.g., 110001"
                        />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="timeline">Preferred Delivery Timeline</Label>
                        <Select value={details.deliveryTimeline} onValueChange={value => handleChange('deliveryTimeline', value)}>
                            <SelectTrigger id="timeline">
                                <SelectValue placeholder="Select a timeline" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1_week">Within 1 Week</SelectItem>
                                <SelectItem value="2_weeks">Within 2 Weeks</SelectItem>
                                <SelectItem value="1_month">Within 1 Month</SelectItem>
                                <SelectItem value="flexible">Flexible</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Bidding Duration</Label>
                        <RadioGroup 
                            value={details.biddingDuration} 
                            onValueChange={value => handleChange('biddingDuration', value)}
                            className="flex items-center space-x-4 pt-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="24" id="24h" />
                                <Label htmlFor="24h">24 Hours</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="48" id="48h" />
                                <Label htmlFor="48h">48 Hours</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
