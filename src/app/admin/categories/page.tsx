
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
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { onCategoriesUpdate, getProductCountForCategory } from '@/lib/categories-service';
import type { Category } from '@/lib/categories-service';
import { CategoryDialog } from '@/components/admin/categories/category-dialog';
import { CategoryActions } from '@/components/admin/categories/category-actions';

interface CategoryWithCount extends Category {
    productCount: number;
}

export default function CategoriesPage() {
    const [categories, setCategories] = React.useState<CategoryWithCount[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);

    React.useEffect(() => {
        const unsubscribe = onCategoriesUpdate((fetchedCategories) => {
            const categoriesWithCounts: CategoryWithCount[] = fetchedCategories.map(c => ({...c, productCount: 0}));
            setCategories(categoriesWithCounts);
            setLoading(false);

            // For each category, set up a listener for its product count
            fetchedCategories.forEach(category => {
                getProductCountForCategory(category.name, (count) => {
                    setCategories(prev => 
                        prev.map(c => c.id === category.id ? { ...c, productCount: count } : c)
                    );
                });
            });
        });
        
        return () => {
            // In a real app, you'd manage unsubscribing from all product count listeners
            // For simplicity, we just log here.
            console.log("Detaching category and product count listeners.");
        };
    }, []);

    const handleCreate = () => {
        setEditingCategory(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsDialogOpen(true);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Manage Categories</h1>
                    <p className="text-muted-foreground">Here you can create, edit, and manage all product categories.</p>
                </div>
                <Button onClick={handleCreate}>
                    <PlusCircle className="mr-2" />
                    Create Category
                </Button>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Category Name</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        <Image
                                            src={category.image || 'https://placehold.co/64'}
                                            alt={category.name}
                                            width={64}
                                            height={64}
                                            className="rounded-md object-cover"
                                            data-ai-hint="category image"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>{category.productCount}</TableCell>
                                    <TableCell className="text-right">
                                        <CategoryActions category={category} onEdit={handleEdit} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CategoryDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                category={editingCategory}
            />
        </div>
    );
}
