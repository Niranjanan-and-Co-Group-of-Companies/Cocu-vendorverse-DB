
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// This is a placeholder for the data structure of a coupon/discount
interface Promotion {
    id: string;
    code: string;
    type: 'Percentage' | 'Fixed Amount';
    value: number;
    status: 'Active' | 'Inactive' | 'Expired';
    usageCount: number;
    usageLimit?: number;
    expiresAt?: Date;
}

const MOCK_PROMOTIONS: Promotion[] = [
    { id: 'promo1', code: 'SUMMER24', type: 'Percentage', value: 15, status: 'Active', usageCount: 152, expiresAt: new Date(2024, 7, 31) },
    { id: 'promo2', code: 'NEWBIE10', type: 'Fixed Amount', value: 10, status: 'Active', usageCount: 890, usageLimit: 1000 },
    { id: 'promo3', code: 'FLASHFRIDAY', type: 'Percentage', value: 25, status: 'Expired', usageCount: 50, expiresAt: new Date(2024, 4, 17) },
    { id: 'promo4', code: 'CORP200', type: 'Fixed Amount', value: 200, status: 'Inactive', usageCount: 0 },
];


export default function PromotionEnginePage() {

    const getStatusVariant = (status: Promotion['status']) => {
        switch (status) {
            case 'Active': return 'default';
            case 'Inactive': return 'secondary';
            case 'Expired': return 'outline';
            default: return 'outline';
        }
    };

    const formatValue = (type: Promotion['type'], value: number) => {
        if (type === 'Percentage') {
            return `${value}%`;
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
    
    const formatDate = (date?: Date) => {
        if (!date) return 'Never';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Promotion Engine</h1>
                    <p className="text-muted-foreground">Create and manage sitewide discounts and coupon codes.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2" />
                    Create Promotion
                </Button>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Coupon Code</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                       {MOCK_PROMOTIONS.map((promo) => (
                            <TableRow key={promo.id}>
                                <TableCell className="font-mono">{promo.code}</TableCell>
                                <TableCell>{promo.type}</TableCell>
                                <TableCell>{formatValue(promo.type, promo.value)}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(promo.status)}>{promo.status}</Badge>
                                </TableCell>
                                <TableCell>{promo.usageCount}{promo.usageLimit ? ` / ${promo.usageLimit}` : ''}</TableCell>
                                <TableCell>{formatDate(promo.expiresAt)}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>Deactivate</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
