
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { getAllProducts, type Product } from '@/lib/products-service';
import Image from 'next/image';

interface CampaignProductsCardProps {
    // This component is currently a placeholder for future functionality.
    // In a real app, it would take `selectedProductIds` and an `onProductSelectionChange` callback.
}

export function CampaignProductsCard({}: CampaignProductsCardProps) {
    const [allProducts, setAllProducts] = React.useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = React.useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = React.useState('');

    React.useEffect(() => {
        getAllProducts().then(setAllProducts);
    }, []);

    const searchResults = React.useMemo(() => {
        if (!searchQuery) return [];
        const lowerCaseQuery = searchQuery.toLowerCase();
        const selectedIds = new Set(selectedProducts.map(p => p.id));
        return allProducts
            .filter(p => !selectedIds.has(p.id) && p.name.toLowerCase().includes(lowerCaseQuery))
            .slice(0, 5);
    }, [searchQuery, allProducts, selectedProducts]);

    const handleSelectProduct = (product: Product) => {
        setSelectedProducts(prev => [...prev, product]);
        setSearchQuery('');
    };
    
    const handleRemoveProduct = (productId: number) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Associated Products (Optional)</CardTitle>
                <CardDescription>
                    If this campaign applies to specific products, add them here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search for a product to add..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchResults.length > 0 && (
                        <div className="absolute top-full mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md z-10">
                            {searchResults.map(item => (
                                <div 
                                    key={item.id} 
                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-accent flex items-center gap-2"
                                    onClick={() => handleSelectProduct(item)}
                                >
                                    <Image src={item.image} alt={item.name} width={24} height={24} className="rounded-sm" />
                                    <span>{item.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <ScrollArea className="h-48 mt-4 pr-4">
                    <div className="space-y-2">
                    {selectedProducts.length > 0 ? selectedProducts.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                             <div className="flex items-center gap-2">
                                <Image src={product.image} alt={product.name} width={32} height={32} className="rounded-md" />
                                <div>
                                    <p className="text-sm font-medium">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">{product.vendor}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveProduct(product.id)}>
                                <X className="h-4 w-4"/>
                            </Button>
                        </div>
                    )) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">No products associated.</p>
                        </div>
                    )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
