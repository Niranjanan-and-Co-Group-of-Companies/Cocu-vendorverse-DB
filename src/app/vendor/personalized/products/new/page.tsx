
'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProductById, type Product } from '@/lib/products-service';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/common/image-upload';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';
// This component will be used for both creating and editing products.

function ProductEditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');
    const { toast } = useToast();

    // A real app would use a more robust state management solution like React Hook Form.
    const [product, setProduct] = React.useState<Partial<Product>>({
        name: '',
        description: '',
        price: '$0.00',
        stock: 0,
        customizable: false,
    });
    const [loading, setLoading] = React.useState(!!productId);
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (productId) {
            getProductById(String(productId)).then((data) => {
                if (data) {
                    setProduct(data);
                }
                setLoading(false);
            });
        }
    }, [productId]);
    
    const handleFieldChange = (field: keyof Product, value: any) => {
        setProduct(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // In a real app, you would call a service function to save the product.
            // await saveProduct(product);
            console.log("Saving product:", product);
            toast({ title: "Product Saved", description: "Your changes have been successfully saved." });
            router.push('/vendor/personalized/products');
        } catch (error) {
            console.error("Failed to save product:", error);
            toast({ title: "Error", description: "Could not save the product.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto">
             <div className="flex items-center justify-between mb-6">
                 <div>
                    <h1 className="text-2xl font-bold">{productId ? 'Edit Product' : 'Create New Product'}</h1>
                    <p className="text-muted-foreground">
                        {productId ? 'Update the details for your product.' : 'Fill out the form to add a new product to your catalog.'}
                    </p>
                 </div>
                 <Button onClick={handleSave} disabled={isSaving}>
                     <Save className="mr-2" />
                     {isSaving ? 'Saving...' : 'Save Product'}
                 </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input id="name" value={product.name} onChange={e => handleFieldChange('name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={product.description} onChange={e => handleFieldChange('description', e.target.value)} rows={5} />
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Media</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ImageUpload onFileSelect={() => {}} imageUrl={product.image} />
                           {/* Add gallery upload logic here */}
                        </CardContent>
                    </Card>
                </div>
                {/* Right Column */}
                <div className="lg:col-span-1 space-y-6 lg:sticky top-20">
                     <Card>
                        <CardHeader>
                            <CardTitle>Pricing & Inventory</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input id="price" value={product.price} onChange={e => handleFieldChange('price', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="stock">Stock Quantity</Label>
                                <Input id="stock" type="number" value={product.stock} onChange={e => handleFieldChange('stock', parseInt(e.target.value, 10))} />
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Options</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="customizable">Customizable</Label>
                                <Switch id="customizable" checked={product.customizable} onCheckedChange={checked => handleFieldChange('customizable', checked)} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}


export default function NewProductPage() {
    // This wrapper is needed for Suspense to work with useSearchParams
    return (
        <React.Suspense fallback={<div>Loading editor...</div>}>
            <ProductEditorContent />
        </React.Suspense>
    );
}
