
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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from '@/components/ui/skeleton';
import type { CommissionRule, CommissionableItem, Override } from '@/lib/commissions-service';
import { onCommissionRulesUpdate, onOverridesUpdate, getCommissionableItems } from '@/lib/commissions-service';
import { CommissionDialog } from '@/components/admin/commissions/commission-dialog';
import { OverrideCard } from '@/components/admin/commissions/override-card';

export default function CommissionsPage() {
    const [retailRules, setRetailRules] = React.useState<CommissionRule[]>([]);
    const [corporateRules, setCorporateRules] = React.useState<CommissionRule[]>([]);
    const [vendorOverrides, setVendorOverrides] = React.useState<Override[]>([]);
    const [productOverrides, setProductOverrides] = React.useState<Override[]>([]);
    
    const [loading, setLoading] = React.useState(true);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingRule, setEditingRule] = React.useState<CommissionRule | Override | null>(null);
    const [editingType, setEditingType] = React.useState<'category' | 'vendor' | 'product'>('category');

    const [vendors, setVendors] = React.useState<CommissionableItem[]>([]);
    const [products, setProducts] = React.useState<CommissionableItem[]>([]);


    React.useEffect(() => {
        const unsubCommissionRules = onCommissionRulesUpdate((data) => {
            setRetailRules(data.filter(d => d.type === 'personalized-retail'));
            setCorporateRules(data.filter(d => d.type === 'corporate-bulk'));
            setLoading(false);
        });
        
        const unsubVendorOverrides = onOverridesUpdate('vendor', setVendorOverrides);
        const unsubProductOverrides = onOverridesUpdate('product', setProductOverrides);

        getCommissionableItems('vendor').then(setVendors);
        getCommissionableItems('product').then(setProducts);

        return () => {
            unsubCommissionRules();
            unsubVendorOverrides();
            unsubProductOverrides();
        };
    }, []);

    const handleEdit = (rule: CommissionRule | Override, type: 'category' | 'vendor' | 'product') => {
        setEditingRule(rule);
        setEditingType(type);
        setIsDialogOpen(true);
    };

    const formatBuffer = (rule: { bufferType: 'fixed' | 'percentage', bufferValue: number }) => {
        if (rule.bufferType === 'fixed') {
            return `$${rule.bufferValue.toFixed(2)}`;
        }
        return `${rule.bufferValue}%`;
    }

    const CommissionTable = ({ rules }: { rules: CommissionRule[] }) => (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category Name</TableHead>
                            <TableHead>Commission Rate</TableHead>
                            <TableHead>Buffer</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? Array.from({length: 5}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                            </TableRow>
                        )) : rules.map(rule => (
                            <TableRow key={rule.id}>
                                <TableCell className="font-medium">{rule.categoryName}</TableCell>
                                <TableCell>{rule.commissionRate}%</TableCell>
                                <TableCell>{formatBuffer(rule)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(rule, 'category')}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Commission Engine</h1>
                    <p className="text-muted-foreground">
                        Define commission rates and pricing buffers for all sales channels.
                    </p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2">
                     <Tabs defaultValue="retail">
                        <TabsList className="mb-4">
                            <TabsTrigger value="retail">Personalized Retail</TabsTrigger>
                            <TabsTrigger value="corporate">Corporate & Bulk</TabsTrigger>
                        </TabsList>
                        <TabsContent value="retail">
                           <CommissionTable rules={retailRules} />
                        </TabsContent>
                        <TabsContent value="corporate">
                           <CommissionTable rules={corporateRules} />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    <OverrideCard 
                        title="Vendor-Specific Overrides"
                        description="Set special commission rates for specific vendors."
                        items={vendors}
                        overrides={vendorOverrides}
                        onEdit={(override) => handleEdit(override, 'vendor')}
                        itemType="vendor"
                        searchPlaceholder="Search for a vendor..."
                    />
                     <OverrideCard 
                        title="Product-Specific Overrides"
                        description="Set granular commission rates for individual products."
                        items={products}
                        overrides={productOverrides}
                        onEdit={(override) => handleEdit(override, 'product')}
                        itemType="product"
                        searchPlaceholder="Search for a product..."
                    />
                </div>
            </div>

            <CommissionDialog 
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                rule={editingRule}
                type={editingType}
            />
        </div>
    );
}
