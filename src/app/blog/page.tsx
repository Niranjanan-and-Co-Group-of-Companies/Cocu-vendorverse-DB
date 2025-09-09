
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const mockPosts = [
    { id: 1, title: 'The Art of Corporate Gifting: A 2024 Guide', date: 'June 15, 2024', image: 'https://picsum.photos/seed/blog1/600/400', excerpt: 'Discover the latest trends in corporate gifting and learn how to make a lasting impression on clients and employees.' },
    { id: 2, title: '5 Personalization Ideas That Go Beyond a Simple Monogram', date: 'June 10, 2024', image: 'https://picsum.photos/seed/blog2/600/400', excerpt: 'Think outside the box with these creative customization ideas that will make any gift truly one-of-a-kind.' },
    { id: 3, title: 'Vendor Spotlight: The Story Behind Heritage Wares', date: 'June 5, 2024', image: 'https://picsum.photos/seed/blog3/600/400', excerpt: 'We sit down with the founder of Heritage Wares to discuss their passion for handcrafted leather goods.' },
];

export default function BlogPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow bg-muted/40 py-12">
                <div className="container max-w-5xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold font-headline">The VendorVerse Blog</h1>
                        <p className="mt-2 text-lg text-muted-foreground">Insights on gifting, vendor stories, and platform updates.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {mockPosts.map(post => (
                            <Card key={post.id} className="flex flex-col">
                                <CardHeader className="p-0">
                                    <Link href="#" className="block aspect-video relative overflow-hidden rounded-t-lg">
                                        <Image src={post.image} alt={post.title} layout="fill" className="object-cover" data-ai-hint="blog post" />
                                    </Link>
                                </CardHeader>
                                <CardContent className="p-6 flex flex-col flex-grow">
                                    <p className="text-sm text-muted-foreground mb-2">{post.date}</p>
                                    <h2 className="text-xl font-semibold font-headline mb-2">
                                        <Link href="#">{post.title}</Link>
                                    </h2>
                                    <p className="text-muted-foreground flex-grow">{post.excerpt}</p>
                                    <Button asChild variant="link" className="p-0 h-auto mt-4 self-start">
                                        <Link href="#">Read More <ArrowRight className="ml-2" /></Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
