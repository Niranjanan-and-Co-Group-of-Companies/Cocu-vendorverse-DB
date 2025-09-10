
'use client';

import * as React from 'react';
import { MessageSquare } from 'lucide-react';


export default function CorporateMessagesPage() {
  return (
    <div className="border rounded-lg bg-card text-card-foreground shadow-sm h-[calc(100vh-6.5rem)] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
            <MessageSquare className="mx-auto h-12 w-12" />
            <p className="mt-4">Messaging functionality is currently disabled.</p>
        </div>
    </div>
  );
}
