
import { Gift, Linkedin, Twitter, Facebook } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
                 <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4">
                    <Gift className="h-6 w-6 text-primary" />
                    <span className="font-headline">VendorVerse</span>
                </Link>
                <p className="text-sm text-muted-foreground">A universe of unique gifts from diverse vendors.</p>
            </div>
          <div>
            <h4 className="font-headline font-semibold">Company</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link href="/careers" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
              <li><Link href="/press" className="text-muted-foreground hover:text-foreground">Press</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-semibold">Gifting</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/category/corporate-gifts" className="text-muted-foreground hover:text-foreground">Corporate Gifting</Link></li>
              <li><Link href="/category/personalized-gifts" className="text-muted-foreground hover:text-foreground">Personalized Gifting</Link></li>
              <li><Link href="/search" className="text-muted-foreground hover:text-foreground">Browse All Gifts</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-semibold">Resources</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
              <li><Link href="/account/support" className="text-muted-foreground hover:text-foreground">Help Center</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</Link></li>
            </ul>
          </div>
           <div>
            <h4 className="font-headline font-semibold">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/admin/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/admin/terms" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
             © {new Date().getFullYear()} VendorVerse. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="https://twitter.com/Firebase" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Twitter size={20}/></Link>
            <Link href="https://www.linkedin.com/company/firebase" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Linkedin size={20}/></Link>
            <Link href="https://www.facebook.com/Firebase" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Facebook size={20}/></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
