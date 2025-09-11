
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Clock, XCircle, FileText, Banknote, MapPin, Building } from 'lucide-react';
import type { VendorKYC } from '@/lib/vendors-service';

interface KycStatusCardProps {
  kyc: VendorKYC;
}

const getStatusIcon = (status: 'Verified' | 'Pending' | 'Failed' | 'Not Submitted') => {
    switch (status) {
        case 'Verified':
            return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case 'Pending':
            return <Clock className="h-5 w-5 text-yellow-500" />;
        case 'Failed':
            return <XCircle className="h-5 w-5 text-destructive" />;
        case 'Not Submitted':
            return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
        default:
            return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
};

const getOverallStatusVariant = (status: VendorKYC['status']) => {
     switch (status) {
        case 'Verified': return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300';
        case 'Pending Review': return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300';
        case 'Failed': return 'bg-destructive/10 text-destructive';
        default: return 'bg-muted text-muted-foreground';
    }
}

export function KycStatusCard({ kyc }: KycStatusCardProps) {

  const kycSteps = [
    { name: 'PAN Verification', status: kyc.panStatus, icon: <FileText /> },
    { name: 'Bank Account', status: kyc.bankAccountStatus, icon: <Banknote /> },
    { name: 'Address Proof', status: kyc.addressProofStatus, icon: <MapPin /> },
    { name: 'GSTIN Details', status: kyc.gstinStatus, icon: <Building /> },
  ];

  return (
    <Card className="lg:sticky top-20">
      <CardHeader>
        <CardTitle>KYC & Verification</CardTitle>
        <CardDescription>Your current account verification status.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`p-3 rounded-md text-center font-medium ${getOverallStatusVariant(kyc.status)}`}>
            Overall Status: {kyc.status}
        </div>
        <ul className="space-y-3">
          {kycSteps.map((step) => (
            <li key={step.name} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                {React.cloneElement(step.icon, { className: "h-4 w-4 text-muted-foreground" })}
                {step.name}
              </span>
              <span className="flex items-center gap-2 font-medium">
                 {getStatusIcon(step.status)}
                {step.status}
              </span>
            </li>
          ))}
        </ul>
        {kyc.status === 'Failed' && kyc.rejectionReason && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm border border-destructive/20">
                <strong>Reason for Rejection:</strong> {kyc.rejectionReason}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
