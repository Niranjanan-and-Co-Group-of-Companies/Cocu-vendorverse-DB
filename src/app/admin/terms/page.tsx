
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getTerms, saveTerms } from '@/lib/legal-service';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { OtpVerificationDialog } from '@/components/admin/terms/otp-verification-dialog';

export default function TermsPage() {
    const [customerTerms, setCustomerTerms] = React.useState('');
    const [vendorTerms, setVendorTerms] = React.useState('');
    const [originalCustomerTerms, setOriginalCustomerTerms] = React.useState('');
    const [originalVendorTerms, setOriginalVendorTerms] = React.useState('');
    
    const [loading, setLoading] = React.useState(true);
    const [savingCustomer, setSavingCustomer] = React.useState(false);
    const [savingVendor, setSavingVendor] = React.useState(false);
    
    const [isOtpOpen, setIsOtpOpen] = React.useState(false);
    const [termsToUpdate, setTermsToUpdate] = React.useState<'Customer' | 'Vendor' | null>(null);

    const { toast } = useToast();

    React.useEffect(() => {
        const fetchTerms = async () => {
            setLoading(true);
            try {
                const { customer, vendor } = await getTerms();
                setCustomerTerms(customer);
                setOriginalCustomerTerms(customer);
                setVendorTerms(vendor);
                setOriginalVendorTerms(vendor);
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
    
    const handleUpdateClick = (type: 'Customer' | 'Vendor') => {
        setTermsToUpdate(type);
        setIsOtpOpen(true);
    };

    const handleFinalUpdate = async () => {
        if (!termsToUpdate) return;
        
        if (termsToUpdate === 'Customer') {
            setSavingCustomer(true);
            try {
                await saveTerms({ customer: customerTerms, vendor: originalVendorTerms });
                setOriginalCustomerTerms(customerTerms);
                toast({
                    title: 'Customer Terms Updated',
                    description: 'The customer terms and conditions have been successfully saved.',
                });
            } catch (error) {
                toast({ title: 'Error Saving Terms', description: 'An unexpected error occurred.', variant: 'destructive' });
                console.error(error);
            } finally {
                setSavingCustomer(false);
            }
        } else if (termsToUpdate === 'Vendor') {
            setSavingVendor(true);
            try {
                await saveTerms({ customer: originalCustomerTerms, vendor: vendorTerms });
                setOriginalVendorTerms(vendorTerms);
                toast({
                    title: 'Vendor Terms Updated',
                    description: 'The vendor terms and conditions have been successfully saved.',
                });
            } catch (error) {
                toast({ title: 'Error Saving Terms', description: 'An unexpected error occurred.', variant: 'destructive' });
                console.error(error);
            } finally {
                setSavingVendor(false);
            }
        }
    };


    const isCustomerChanged = customerTerms !== originalCustomerTerms;
    const isVendorChanged = vendorTerms !== originalVendorTerms;

    return (
        <>
            <div className="flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Terms & Conditions</h1>
                        <p className="text-muted-foreground">Manage the legal terms for customers and vendors.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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
                                    disabled={savingCustomer || savingVendor}
                                />
                            )}
                        </CardContent>
                         {isCustomerChanged && (
                            <CardFooter>
                                <Button onClick={() => handleUpdateClick('Customer')} disabled={savingCustomer} className="ml-auto">
                                    {savingCustomer && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Customer Terms
                                </Button>
                            </CardFooter>
                        )}
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
                                    disabled={savingCustomer || savingVendor}
                                />
                            )}
                        </CardContent>
                         {isVendorChanged && (
                            <CardFooter>
                                <Button onClick={() => handleUpdateClick('Vendor')} disabled={savingVendor} className="ml-auto">
                                    {savingVendor && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Vendor Terms
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>
            <OtpVerificationDialog 
                isOpen={isOtpOpen}
                onOpenChange={setIsOtpOpen}
                onVerified={handleFinalUpdate}
                termsType={termsToUpdate}
            />
        </>
    );
}
