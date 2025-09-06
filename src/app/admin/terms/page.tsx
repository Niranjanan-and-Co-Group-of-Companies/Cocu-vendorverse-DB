
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getTerms, saveTerms } from '@/lib/legal-service';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function TermsPage() {
    const [customerTerms, setCustomerTerms] = React.useState('');
    const [vendorTerms, setVendorTerms] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        const fetchTerms = async () => {
            setLoading(true);
            try {
                const { customer, vendor } = await getTerms();
                setCustomerTerms(customer);
                setVendorTerms(vendor);
            } catch (error) {
                 toast({
                    title: 'Error Fetching Terms',
                    description: 'Could not load existing terms and conditions.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchTerms();
    }, [toast]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveTerms({ customer: customerTerms, vendor: vendorTerms });
            toast({
                title: 'Terms Updated',
                description: 'The terms and conditions have been successfully saved.',
            });
        } catch (error) {
            toast({
                title: 'Error Saving Terms',
                description: 'An unexpected error occurred. Please try again.',
                variant: 'destructive',
            });
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Terms & Conditions</h1>
                    <p className="text-muted-foreground">Manage the legal terms for customers and vendors.</p>
                </div>
                 <Button onClick={handleSave} disabled={saving || loading}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Terms & Conditions</CardTitle>
                        <CardDescription>These terms are shown to customers during signup and when updated.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                             <Skeleton className="h-96 w-full" />
                        ) : (
                             <Textarea 
                                value={customerTerms}
                                onChange={(e) => setCustomerTerms(e.target.value)}
                                rows={20}
                                placeholder="Enter customer terms and conditions here..."
                                disabled={saving}
                            />
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Vendor Terms & Conditions</CardTitle>
                        <CardDescription>These terms are shown to vendors during onboarding and when updated.</CardDescription>
                    </CardHeader>
                    <CardContent>
                          {loading ? (
                             <Skeleton className="h-96 w-full" />
                        ) : (
                             <Textarea 
                                value={vendorTerms}
                                onChange={(e) => setVendorTerms(e.target.value)}
                                rows={20}
                                placeholder="Enter vendor terms and conditions here..."
                                disabled={saving}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
