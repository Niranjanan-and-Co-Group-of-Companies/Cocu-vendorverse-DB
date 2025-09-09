

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Rss } from 'lucide-react';
import { getPublishedPosts, type BlogPost } from '@/lib/blog-service';

function PostCard({ post }: { post: BlogPost }) {
    const excerpt = (post.content.find(block => block.type === 'text')?.value || '').substring(0, 150) + '...';
    
    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
        <Card key={post.id} className="flex flex-col">
            <CardHeader className="p-0">
                {post.featuredImage && (
                    <Link href={`/blog/${post.slug}`} className="block aspect-video relative overflow-hidden rounded-t-lg">
                        <Image src={post.featuredImage} alt={post.title} layout="fill" className="object-cover" data-ai-hint="blog post" />
                    </Link>
                )}
            </CardHeader>
            <CardContent className="p-6 flex flex-col flex-grow">
                <p className="text-sm text-muted-foreground mb-2">{formatDate(post.createdAt)}</p>
                <h2 className="text-xl font-semibold font-headline mb-2">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-muted-foreground flex-grow">{excerpt}</p>
            </CardContent>
            <CardFooter className="p-6 pt-0">
                 <Button asChild variant="link" className="p-0 h-auto self-start">
                    <Link href={`/blog/${post.slug}`}>Read More <ArrowRight className="ml-2" /></Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

export default async function BlogPage() {
    const posts = await getPublishedPosts();

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow bg-muted/40 py-12">
                <div className="container max-w-5xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold font-headline">The VendorVerse Blog</h1>
                        <p className="mt-2 text-lg text-muted-foreground">Insights on gifting, vendor stories, and platform updates.</p>
                    </div>

                    {posts.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <Rss className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h2 className="mt-4 text-xl font-semibold">No posts yet</h2>
                            <p className="mt-2 text-muted-foreground">Check back soon to read our latest articles!</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
