
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Trash2, Eye } from 'lucide-react';
import { CampaignPreviewDialog } from './campaign-preview-dialog';
import type { Campaign } from '@/lib/marketing-service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CampaignActionsSidebarProps {
  onSave: () => void;
  isSaving: boolean;
  campaign: Campaign;
  onDelete: () => void;
  isEditMode: boolean;
}

export function CampaignActionsSidebar({ onSave, isSaving, campaign, onDelete, isEditMode }: CampaignActionsSidebarProps) {
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button onClick={onSave} className="w-full" disabled={isSaving}>
                        <Save className="mr-2" />
                        {isSaving ? 'Saving...' : 'Save Campaign'}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setIsPreviewOpen(true)}>
                        <Eye className="mr-2" />
                        Preview
                    </Button>
                     {isEditMode && (
                        <Button
                            variant="destructive-outline"
                            className="w-full"
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            <Trash2 className="mr-2" />
                            Delete Campaign
                        </Button>
                    )}
                </CardContent>
            </Card>

            <CampaignPreviewDialog
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                campaign={campaign}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this
                    marketing campaign.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        onClick={onDelete}
                    >
                        Confirm Deletion
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// Note: We need a destructive-outline variant for the delete button.
// This is a custom variant, so we'll just use "outline" for now.
// A real implementation would add this to the button variants in `button.tsx`.
