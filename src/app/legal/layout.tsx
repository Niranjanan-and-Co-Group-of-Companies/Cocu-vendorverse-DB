
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-muted/40 py-12">
            <div className="container max-w-4xl">
                 <Card>
                    <CardContent className="p-8 prose prose-sm dark:prose-invert max-w-none">
                        {children}
                    </CardContent>
                 </Card>
            </div>
        </main>
        <Footer />
    </div>
  );
}
