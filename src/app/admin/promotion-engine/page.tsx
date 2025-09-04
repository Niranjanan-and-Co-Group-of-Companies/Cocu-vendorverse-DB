
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
import type { Promotion } from '@/lib/promotions-service';
import { onPromotionsUpdate } from '@/lib/promotions-service';
import { PromotionDialog } from '@/components/admin/promotions/promotion-dialog';
import { PromotionActions } from '@/components/admin/promotions/promotion-actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function PromotionEnginePage() {
    const [promotions, setPromotions] = React.useState<Promotion[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingPromotion, setEditingPromotion] = React.useState<Promotion | null>(null);

    React.useEffect(() => {
        const unsubscribe = onPromotionsUpdate((data) => {
            setPromotions(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleCreate = () => {
        setEditingPromotion(null);
        setIsDialogOpen(true);
    };
    
    const handleEdit = (promotion: Promotion) => {
        setEditingPromotion(promotion);
        setIsDialogOpen(true);
    }

    const getStatusVariant = (status: Promotion['status']) => {
        switch (status) {
            case 'Active': return 'default';
            case 'Inactive': return 'secondary';
            case 'Expired': return 'outline';
            default: return 'outline';
        }
    };
    
    const getPlatformVariant = (platform: Promotion['platform']) => {
        switch (platform) {
            case 'Corporate': return 'secondary';
            case 'Personalized': return 'outline';
            case 'Both': return 'default';
            default: return 'outline';
        }
    }

    const formatValue = (type: Promotion['type'], value: number) => {
        if (type === 'Percentage') {
            return `${value}%`;
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
    
    const formatDate = (date?: any) => {
        if (!date) return 'Never';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Promotion Engine</h1>
                    <p className="text-muted-foreground">Create and manage sitewide discounts and coupon codes.</p>
                </div>
                <Button onClick={handleCreate}>
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
                            <TableHead>Platform</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             Array.from({ length: 4 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : promotions.map((promo) => (
                            <TableRow key={promo.id}>
                                <TableCell className="font-mono">{promo.code}</TableCell>
                                <TableCell>{promo.type}</TableCell>
                                <TableCell>{formatValue(promo.type, promo.value)}</TableCell>
                                <TableCell>
                                    <Badge variant={getPlatformVariant(promo.platform)}>{promo.platform}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(promo.status)}>{promo.status}</Badge>
                                </TableCell>
                                <TableCell>{promo.usageCount}{promo.usageLimit ? ` / ${promo.usageLimit}` : ''}</TableCell>
                                <TableCell>{formatDate(promo.expiresAt)}</TableCell>
                                <TableCell className="text-right">
                                    <PromotionActions promotion={promo} onEdit={() => handleEdit(promo)} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <PromotionDialog 
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                promotion={editingPromotion}
            />
        </div>
    );
}
