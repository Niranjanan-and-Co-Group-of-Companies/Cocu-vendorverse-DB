
'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getCampaignById, saveCampaign, type Campaign } from '@/lib/marketing-service';
import { CampaignDetailsCard } from '@/components/admin/marketing/campaign-details-card';
import { CampaignCreativesCard } from '@/components/admin/marketing/campaign-creatives-card';
import { CampaignProductsCard } from '@/components/admin/marketing/campaign-products-card';
import { CampaignActionsSidebar } from '@/components/admin/marketing/campaign-actions-sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { deleteCampaign } from '@/lib/marketing-service';

export type CampaignCreative = {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageFile?: File | null;
  imageUrl?: string;
  videoUrl?: string;
};

// Create a default empty campaign state
const createDefaultCampaign = (): Omit<Campaign, 'id'> => ({
  name: '',
  type: 'Sale',
  status: 'Draft',
  startDate: new Date(),
  endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
  description: '',
  audience: 'All',
  platform: 'Personalized',
  placement: 'homepage-hero',
  creatives: [
    {
      id: 'creative_initial',
      title: 'New Exciting Offer',
      description: 'Check out our latest promotion.',
      ctaText: 'Shop Now',
      ctaLink: '/products',
      imageUrl: '',
      videoUrl: '',
    },
  ],
});


function NewCampaignPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('id');
    const { toast } = useToast();

    const [campaign, setCampaign] = React.useState<Partial<Campaign>>(createDefaultCampaign());
    const [loading, setLoading] = React.useState(!!campaignId);
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (campaignId) {
            getCampaignById(campaignId).then((data) => {
                if (data) {
                    // Convert Firestore Timestamps to JS Dates
                    const campaignData = {
                        ...data,
                        startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(),
                        endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(),
                    };
                    setCampaign(campaignData);
                }
                setLoading(false);
            });
        }
    }, [campaignId]);

    const handleFieldChange = (field: keyof Campaign, value: any) => {
        setCampaign(prev => ({ ...prev, [field]: value }));
    };
    
    const handleCreativeChange = (updatedCreative: CampaignCreative) => {
        setCampaign(prev => ({
            ...prev,
            creatives: prev.creatives?.map(c => c.id === updatedCreative.id ? updatedCreative : c)
        }));
    };
    
    const handleAddCreative = () => {
        const newCreative: CampaignCreative = {
            id: `creative_${Date.now()}`,
            title: 'New Creative', description: '', ctaText: 'Learn More', ctaLink: '#',
        };
        setCampaign(prev => ({ ...prev, creatives: [...(prev.creatives || []), newCreative]}));
    }

    const handleRemoveCreative = (creativeId: string) => {
        setCampaign(prev => ({...prev, creatives: prev.creatives?.filter(c => c.id !== creativeId)}));
    }

    const handleSave = async () => {
        if (!campaign.name?.trim()) {
            toast({
                title: 'Campaign Name Required',
                description: 'Please enter a name for your campaign before saving.',
                variant: 'destructive',
            });
            return;
        }

        setIsSaving(true);
        try {
            await saveCampaign(campaign as Campaign);
            toast({ title: "Campaign Saved", description: "Your changes have been successfully saved." });
            router.push('/admin/marketing');
        } catch (error) {
            console.error("Failed to save campaign:", error);
            toast({ title: "Error", description: "Could not save the campaign.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async () => {
        if (!campaignId) return;
        try {
            await deleteCampaign(campaignId);
            toast({ title: 'Campaign Deleted', description: 'The campaign has been permanently removed.', variant: 'destructive' });
            router.push('/admin/marketing');
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete campaign.', variant: 'destructive' });
        }
    }


    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
                <CampaignDetailsCard 
                    campaign={campaign as Campaign} 
                    onFieldChange={handleFieldChange} 
                />
                <CampaignCreativesCard
                    creatives={campaign.creatives || []}
                    onCreativeChange={handleCreativeChange}
                    onAddCreative={handleAddCreative}
                    onRemoveCreative={handleRemoveCreative}
                />
                <CampaignProductsCard />
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 lg:sticky top-20">
                <CampaignActionsSidebar
                    onSave={handleSave}
                    isSaving={isSaving}
                    campaign={campaign as Campaign}
                    onDelete={handleDelete}
                    isEditMode={!!campaignId}
                />
            </div>
        </div>
    );
}


export default function NewCampaignPage() {
    return (
        <React.Suspense fallback={<div>Loading campaign...</div>}>
            <NewCampaignPageContent />
        </React.Suspense>
    );
}
