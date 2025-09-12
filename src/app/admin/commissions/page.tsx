

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
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from '@/components/ui/skeleton';
import type { CommissionRule, Override } from '@/lib/commissions-service';
import { getCommissionableItems } from '@/lib/commissions-service';
import { onCommissionRulesUpdate, onOverridesUpdate } from '@/lib/commissions-client-service';
import { CommissionDialog } from '@/components/admin/commissions/commission-dialog';
import { OverrideCard } from '@/components/admin/commissions/override-card';

export default function CommissionsPage() {
    const [allRules, setAllRules] = React.useState<CommissionRule[]>([]);
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
            setAllRules(data);
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

    const CommissionTable = ({ rules, type }: { rules: CommissionRule[], type: 'personalized-retail' | 'corporate-bulk' }) => {
        const filteredRules = rules.filter(r => r.type === type);
        
        return (
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category Name</TableHead>
                                <TableHead>Commission Rate</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? Array.from({length: 5}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            )) : filteredRules.map(rule => {
                                const isSunshine = rule.categoryName === 'Made by Sunshine';
                                return (
                                <TableRow key={rule.id}>
                                    <TableCell className="font-medium">{rule.categoryName}</TableCell>
                                    <TableCell>{isSunshine ? <span className="text-muted-foreground">N/A</span> : `${rule.commissionRate}%`}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(rule, 'category')}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )}
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )
    };


    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Commission Engine</h1>
                    <p className="text-muted-foreground">
                        Define commission rates for all sales channels.
                    </p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2">
                     <Tabs defaultValue="personalized-retail">
                        <TabsList className="mb-4">
                            <TabsTrigger value="personalized-retail">Personalized Retail</TabsTrigger>
                            <TabsTrigger value="corporate-bulk">Corporate & Bulk</TabsTrigger>
                        </TabsList>
                        <TabsContent value="personalized-retail">
                           <CommissionTable rules={allRules} type="personalized-retail" />
                        </TabsContent>
                        <TabsContent value="corporate-bulk">
                           <CommissionTable rules={allRules} type="corporate-bulk" />
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
