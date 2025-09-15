
import { getPostBySlug, getPublishedPosts } from '@/lib/blog-service';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-muted/40 py-12">
        <div className="container max-w-4xl">
            <article>
                <header className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight mb-4">{post.title}</h1>
                    <p className="text-muted-foreground">
                        Posted by {post.author} on {formatDate(post.createdAt)}
                    </p>
                </header>

                {post.featuredImage && (
                    <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
                        <Image src={post.featuredImage} alt={post.title} fill className="object-cover" priority />
                    </div>
                )}
                
                <Card>
                    <CardContent className="p-8 prose prose-lg dark:prose-invert max-w-none">
                        {post.content.map(block => {
                            if (block.type === 'text') {
                                return <p key={block.id}>{block.value}</p>;
                            }
                            if (block.type === 'image') {
                                return (
                                    <div key={block.id} className="relative aspect-video my-8 rounded-lg overflow-hidden">
                                        <Image src={block.value} alt="Blog content image" fill className="object-cover" />
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </CardContent>
                </Card>
            </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
