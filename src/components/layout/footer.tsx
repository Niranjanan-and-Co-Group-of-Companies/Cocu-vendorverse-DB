
'use client';

import { Linkedin, Twitter, Facebook, Gift } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
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
import { LegalModal } from './legal-modal';
import { ContactModal } from './contact-modal';
import Image from 'next/image';

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [targetHref, setTargetHref] = React.useState('');
  const [platformName, setPlatformName] = React.useState('');
  const [legalModalContent, setLegalModalContent] = React.useState<'terms' | 'privacy' | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = React.useState(false);

  const isCorporate = pathname.startsWith('/corporate');
  const homeHref = isCorporate ? '/corporate/dashboard' : '/';

  const handlePlatformSwitch = (e: React.MouseEvent, href: string, name: string) => {
      e.preventDefault();
      setTargetHref(href);
      setPlatformName(name);
      setDialogOpen(true);
  };
  
  const handleConfirmSwitch = () => {
    // In a real app, this would trigger a logout function.
    console.log(`Logging out and redirecting to ${targetHref}`);
    router.push(targetHref);
  }

  const openLegalModal = (e: React.MouseEvent, type: 'terms' | 'privacy') => {
      e.preventDefault();
      setLegalModalContent(type);
  };

  const openContactModal = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsContactModalOpen(true);
  }

  return (
    <>
    <footer className="border-t bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
                 <Link href={homeHref} className="flex items-center gap-2 font-bold text-lg mb-4">
                    <Image src="/logo.svg" alt="CO&Cu logo" width={180} height={72} className="h-auto w-auto max-h-24" />
                </Link>
                <p className="text-sm text-muted-foreground">
                    Where Custom Meets Care
                </p>
            </div>
          <div>
            <h4 className="font-headline font-semibold">Gifting</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link 
                    href="/corporate/dashboard" 
                    onClick={!isCorporate ? (e) => handlePlatformSwitch(e, '/corporate/dashboard', 'Corporate') : undefined}
                    className="text-muted-foreground hover:text-foreground"
                >
                    Corporate Gifting
                </Link>
              </li>
              <li>
                 <Link 
                    href="/" 
                    onClick={isCorporate ? (e) => handlePlatformSwitch(e, '/', 'Personalized') : undefined}
                    className="text-muted-foreground hover:text-foreground"
                >
                    Personalized Gifting
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-semibold">Resources</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
              <li><Link href="/account/support" className="text-muted-foreground hover:text-foreground">Help Center</Link></li>
              <li><a href="#" onClick={openContactModal} className="text-muted-foreground hover:text-foreground">Contact Us</a></li>
            </ul>
          </div>
           <div>
            <h4 className="font-headline font-semibold">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" onClick={(e) => openLegalModal(e, 'terms')} className="text-muted-foreground hover:text-foreground">Terms of Service</a></li>
              <li><a href="#" onClick={(e) => openLegalModal(e, 'privacy')} className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-semibold">For Vendors</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/vendor/signup" className="text-muted-foreground hover:text-foreground">Register as a Vendor</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
            <div className="flex gap-4">
                <Link href="https://twitter.com/coandcu" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Twitter size={20}/></Link>
                <Link href="https://linkedin.com/company/coandcu" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Linkedin size={20}/></Link>
                <Link href="https://facebook.com/coandcu" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Facebook size={20}/></Link>
            </div>
        </div>
        <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
             © {new Date().getFullYear()} CO&Cu. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
     <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to {platformName} Portal?</AlertDialogTitle>
            <AlertDialogDescription>
              To access the {platformName} portal, you will be logged out of your current session. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay Here</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSwitch}>Logout &amp; Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <LegalModal type={legalModalContent} onOpenChange={() => setLegalModalContent(null)} />
      <ContactModal open={isContactModalOpen} onOpenChange={setIsContactModalOpen} />
    </>
  );
}
