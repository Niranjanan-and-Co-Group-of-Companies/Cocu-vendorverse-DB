
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
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Megaphone, Gift, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
    onCampaignsUpdate,
    duplicateCampaign,
    deleteCampaign,
    type Campaign,
    type CampaignStatus,
    type CampaignType,
} from '@/lib/marketing-service';
import { CampaignActions } from '@/components/admin/marketing/campaign-actions';
import { useToast } from '@/hooks/use-toast';

export default function MarketingPage() {
    const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        const unsubscribe = onCampaignsUpdate((data) => {
            setCampaigns(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDuplicate = async (campaignId: string) => {
        try {
            await duplicateCampaign(campaignId);
            toast({ title: 'Campaign Duplicated', description: 'A copy of the campaign has been created as a draft.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to duplicate campaign.', variant: 'destructive' });
        }
    };

    const handleDelete = async (campaignId: string) => {
        try {
            await deleteCampaign(campaignId);
            toast({ title: 'Campaign Deleted', description: 'The campaign has been permanently removed.', variant: 'destructive' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete campaign.', variant: 'destructive' });
        }
    };

    const getStatusVariant = (status: CampaignStatus) => {
        switch (status) {
            case 'Active': return 'default';
            case 'Scheduled': return 'secondary';
            case 'Finished': return 'outline';
            case 'Draft': return 'secondary';
            default: return 'outline';
        }
    };

    const getTypeIcon = (type: CampaignType) => {
        switch (type) {
            case 'Sale': return <Megaphone className="h-5 w-5 text-muted-foreground" />;
            case 'Promotion': return <Gift className="h-5 w-5 text-muted-foreground" />;
            case 'Flash Sale': return <Zap className="h-5 w-5 text-muted-foreground" />;
            default: return <Megaphone className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Marketing Campaigns</h1>
                    <p className="text-muted-foreground">Create and manage promotional campaigns for your marketplace.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/marketing/new">
                        <PlusCircle className="mr-2" />
                        Create Campaign
                    </Link>
                </Button>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Campaign Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell><div className="flex items-center gap-2"><Skeleton className="h-5 w-5 rounded-full" /><Skeleton className="h-5 w-20" /></div></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            campaigns.map((campaign) => (
                                <TableRow key={campaign.id}>
                                    <TableCell className="font-medium">{campaign.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(campaign.type)}
                                            <span>{campaign.type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(campaign.status)}>{campaign.status}</Badge>
                                    </TableCell>
                                    <TableCell>{formatDate(campaign.startDate)}</TableCell>
                                    <TableCell>{formatDate(campaign.endDate)}</TableCell>
                                    <TableCell className="text-right">
                                        <CampaignActions
                                            campaignId={campaign.id}
                                            onDuplicate={() => handleDuplicate(campaign.id)}
                                            onDelete={() => handleDelete(campaign.id)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
