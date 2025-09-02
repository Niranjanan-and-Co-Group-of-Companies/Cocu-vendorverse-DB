
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { UploadCloud } from 'lucide-react';

export interface AdditionalInfo {
    notes: string;
    briefFile: File | null;
}

interface AdditionalInfoCardProps {
    info: AdditionalInfo;
    onInfoChange: (info: AdditionalInfo) => void;
}

export function AdditionalInfoCard({ info, onInfoChange }: AdditionalInfoCardProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onInfoChange({ ...info, briefFile: e.target.files?.[0] || null });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Additional Information (Optional)</CardTitle>
                <CardDescription>Provide any extra details or documents for vendors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="notes">Notes for Vendors</Label>
                    <Textarea 
                        id="notes" 
                        placeholder="e.g., Special packaging instructions, branding guidelines, etc."
                        value={info.notes}
                        onChange={e => onInfoChange({ ...info, notes: e.target.value })}
                        rows={4}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="brief">Upload a Brief</Label>
                    <div className="relative">
                        <div className="w-full flex items-center justify-center rounded-md border-2 border-dashed border-muted p-6">
                            <div className="text-center">
                                <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">Drag & drop or click to upload</p>
                                <p className="text-xs text-muted-foreground">PDF, DOCX, PPTX (max 5MB)</p>
                                {info.briefFile && <p className="text-sm font-medium mt-2">{info.briefFile.name}</p>}
                            </div>
                        </div>
                        <Input 
                            id="brief" 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
