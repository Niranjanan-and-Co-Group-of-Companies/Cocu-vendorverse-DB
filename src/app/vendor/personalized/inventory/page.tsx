
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
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { onVendorProductsUpdate, type ProductWithStatus } from '@/lib/products-client-service';
import { updateProductInventory } from '@/lib/products-service';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/products';
import { InventoryActions } from '@/components/vendor/inventory/inventory-actions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

type EditingState = {
    [productId: string]: {
        stock: string;
        inventoryBuffer: string;
    };
};

type SavingState = {
    [productId: string]: boolean;
}

function InventoryTable() {
    const [products, setProducts] = React.useState<ProductWithStatus[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [editingState, setEditingState] = React.useState<EditingState>({});
    const [savingState, setSavingState] = React.useState<SavingState>({});
    const { toast } = useToast();
    
    // In a real app, you would get the vendor's ID from an authentication context.
    const VENDOR_ID = 'vendor001'; 

    React.useEffect(() => {
        const unsubscribe = onVendorProductsUpdate(VENDOR_ID, (products) => {
            setProducts(products);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [VENDOR_ID]);

    const handleInputChange = (productId: string, field: 'stock' | 'inventoryBuffer', value: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        setEditingState(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                stock: prev[productId]?.stock ?? String(product.stock),
                inventoryBuffer: prev[productId]?.inventoryBuffer ?? String(product.inventoryBuffer),
                [field]: value
            }
        }));
    };

    const handleSave = async (productId: string) => {
        const editedData = editingState[productId];
        if (!editedData) return;

        setSavingState(prev => ({ ...prev, [productId]: true }));

        const stock = parseInt(editedData.stock, 10);
        const inventoryBuffer = parseInt(editedData.inventoryBuffer, 10);

        if (isNaN(stock) || isNaN(inventoryBuffer) || stock < 0 || inventoryBuffer < 0) {
            toast({ title: 'Invalid Input', description: 'Stock and buffer must be non-negative numbers.', variant: 'destructive' });
            setSavingState(prev => ({ ...prev, [productId]: false }));
            return;
        }

        try {
            await updateProductInventory(productId, stock, inventoryBuffer);
            toast({ title: 'Inventory Updated', description: `Stock for product #${productId.slice(0,6)} has been updated.` });
            // Clear editing state for this product
            setEditingState(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update inventory.', variant: 'destructive' });
        } finally {
             setSavingState(prev => ({ ...prev, [productId]: false }));
        }
    };

    const getStatusInfo = (product: Product, editedStock?: string): { text: string; variant: 'default' | 'destructive' | 'secondary' } => {
        const stock = editedStock ? parseInt(editedStock, 10) : product.stock;
        
        if (isNaN(stock) || stock <= 0) {
            return { text: 'Out of Stock', variant: 'destructive' };
        }
        if (stock < 10) {
            return { text: 'Low Stock', variant: 'secondary' };
        }
        return { text: 'In Stock', variant: 'default' };
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>
                            <div className="flex items-center gap-1">
                                Buffer
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Items held back from public stock to prevent overselling.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </TableHead>
                        <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-9 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-9 w-20" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : (
                        products.map((product) => {
                            const isEditing = !!editingState[product.id];
                            const isSaving = !!savingState[product.id];
                            const currentStock = isEditing ? editingState[product.id].stock : String(product.stock);
                            const currentBuffer = isEditing ? editingState[product.id].inventoryBuffer : String(product.inventoryBuffer);
                            const statusInfo = getStatusInfo(product, currentStock);

                            return (
                                <TableRow key={product.id} className={isEditing ? 'bg-accent/50' : ''}>
                                    <TableCell>
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            width={64}
                                            height={64}
                                            className="rounded-md object-cover"
                                            data-ai-hint="product image"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Input 
                                            type="number" 
                                            className="w-24 h-9" 
                                            value={currentStock}
                                            onChange={(e) => handleInputChange(product.id, 'stock', e.target.value)}
                                        />
                                    </TableCell>
                                     <TableCell>
                                        <Input 
                                            type="number" 
                                            className="w-24 h-9" 
                                            value={currentBuffer}
                                            onChange={(e) => handleInputChange(product.id, 'inventoryBuffer', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <InventoryActions
                                            product={product}
                                            isEditing={isEditing}
                                            isSaving={isSaving}
                                            onSave={() => handleSave(product.id)}
                                        />
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export default function VendorInventoryPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold">Inventory Management</h1>
                <p className="text-muted-foreground">Quickly update stock levels for your retail products.</p>
            </div>
            <InventoryTable />
        </div>
    );
}
