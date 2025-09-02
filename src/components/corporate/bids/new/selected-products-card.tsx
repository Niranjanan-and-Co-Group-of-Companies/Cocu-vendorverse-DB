
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useBidRequest } from '@/hooks/use-bid-request';

export function SelectedProductsCard() {
    const { items, removeItem } = useBidRequest();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Selected Products ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-48 pr-4">
                    <div className="space-y-3">
                        {items.map(product => (
                            <div key={product.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Image src={product.image} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                                    <div>
                                        <p className="text-sm font-medium truncate">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">{product.category}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(product.id)}>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
