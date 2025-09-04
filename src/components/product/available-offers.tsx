
'use client';

import * as React from 'react';
import { getAvailableOffers, type Promotion } from '@/lib/promotions-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface AvailableOffersProps {
    categoryId?: string;
    productId?: number;
}

export function AvailableOffers({ categoryId, productId }: AvailableOffersProps) {
    const [offers, setOffers] = React.useState<Promotion[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        async function fetchOffers() {
            if (!categoryId && !productId) {
                setLoading(false);
                return;
            }
            setLoading(true);
            const availableOffers = await getAvailableOffers(categoryId, productId);
            setOffers(availableOffers);
            setLoading(false);
        }
        fetchOffers();
    }, [categoryId, productId]);

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({
            title: 'Coupon Code Copied!',
            description: `"${code}" has been copied to your clipboard.`,
        });
    };
    
    if (loading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    if (offers.length === 0) {
        return null; // Don't render anything if there are no offers
    }

    const formatValue = (type: Promotion['type'], value: number) => {
        if (type === 'Percentage') {
            return `${value}% OFF`;
        }
        return `$${value} OFF`;
    }

    return (
        <div>
            <h3 className="font-semibold text-lg mb-2">Available Promotions</h3>
            <div className="space-y-2">
                {offers.map((offer) => (
                    <div 
                        key={offer.id} 
                        className="flex items-center justify-between p-3 border rounded-lg bg-muted/50 cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handleCopyCode(offer.code)}
                    >
                        <div className="flex items-center gap-3">
                            <Tag className="h-5 w-5 text-primary" />
                            <div>
                                <p className="font-semibold text-primary">{formatValue(offer.type, offer.value)}</p>
                                <p className="text-sm text-muted-foreground">Use code: <span className="font-bold">{offer.code}</span></p>
                            </div>
                        </div>
                        <Badge variant="secondary">Tap to Copy</Badge>
                    </div>
                ))}
            </div>
        </div>
    );
}
