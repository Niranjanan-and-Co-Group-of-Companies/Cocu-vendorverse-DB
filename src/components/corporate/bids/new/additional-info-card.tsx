
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { UploadCloud, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface AdditionalInfo {
    notes: string;
    briefFiles: File[];
}

interface AdditionalInfoCardProps {
    info: AdditionalInfo;
    onInfoChange: (info: AdditionalInfo) => void;
}

export function AdditionalInfoCard({ info, onInfoChange }: AdditionalInfoCardProps) {
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (info.briefFiles.length + files.length > 2) {
            toast({
                title: "Upload limit reached",
                description: "You can upload a maximum of 2 documents.",
                variant: "destructive",
            });
            return;
        }
        onInfoChange({ ...info, briefFiles: [...info.briefFiles, ...files] });
    }

    const handleRemoveFile = (fileToRemove: File) => {
        onInfoChange({
            ...info,
            briefFiles: info.briefFiles.filter(file => file !== fileToRemove)
        });
    };


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
                    <Label htmlFor="brief">Upload Briefs (Max 2)</Label>
                    <div className="relative">
                        <div className="w-full flex items-center justify-center rounded-md border-2 border-dashed border-muted p-6">
                            <div className="text-center">
                                <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">Drag & drop or click to upload</p>
                                <p className="text-xs text-muted-foreground">PDF, DOCX, PPTX (max 5MB each)</p>
                            </div>
                        </div>
                        <Input 
                            id="brief" 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                            multiple
                            disabled={info.briefFiles.length >= 2}
                        />
                    </div>
                     {info.briefFiles.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {info.briefFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 text-sm rounded-md bg-muted">
                                    <span className="truncate">{file.name}</span>
                                    <button onClick={() => handleRemoveFile(file)} className="text-destructive hover:text-destructive/80">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
