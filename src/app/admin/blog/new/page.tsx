
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { savePost, getPostById, type BlogPost, type ContentBlock } from '@/lib/blog-service';
import { Loader2, Plus, Trash2, Upload, GripVertical, Video } from 'lucide-react';
import { ImageUpload } from '@/components/common/image-upload';
import { Skeleton } from '@/components/ui/skeleton';

function NewPostPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const postId = searchParams.get('id');
    const { toast } = useToast();

    const [title, setTitle] = React.useState('');
    const [author, setAuthor] = React.useState('VendorVerse Admin');
    const [featuredImage, setFeaturedImage] = React.useState<File | null>(null);
    const [featuredImageUrl, setFeaturedImageUrl] = React.useState('');
    const [content, setContent] = React.useState<ContentBlock[]>([]);
    const [imageFiles, setImageFiles] = React.useState<Record<string, File | null>>({});

    const [loading, setLoading] = React.useState(!!postId);
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (postId) {
            getPostById(postId).then(post => {
                if (post) {
                    setTitle(post.title);
                    setAuthor(post.author);
                    setFeaturedImageUrl(post.featuredImage);
                    setContent(post.content);
                }
                setLoading(false);
            });
        }
    }, [postId]);

    const addContentBlock = (type: ContentBlock['type']) => {
        const newBlock: ContentBlock = { id: `block_${Date.now()}`, type, value: '' };
        setContent([...content, newBlock]);
    };

    const updateContentBlock = (id: string, value: string) => {
        setContent(content.map(block => block.id === id ? { ...block, value } : block));
    };

    const handleBlockImageUpload = (id: string, file: File | null) => {
        setImageFiles(prev => ({ ...prev, [id]: file }));
        if (file) {
            updateContentBlock(id, URL.createObjectURL(file));
        }
    };
    
    const removeContentBlock = (id: string) => {
        setContent(content.filter(block => block.id !== id));
        setImageFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[id];
            return newFiles;
        });
    };

    const handleSave = async (status: 'Draft' | 'Published') => {
        if (!title.trim() || !author.trim()) {
            toast({ title: 'Title and Author are required', variant: 'destructive' });
            return;
        }
        setIsSaving(true);
        try {
            await savePost({
                id: postId,
                title,
                author,
                content,
                status,
                featuredImage,
                imageFiles
            });
            toast({ title: `Post ${status === 'Published' ? 'Published' : 'Saved'}`, description: 'Your blog post has been saved.' });
            router.push('/admin/blog');
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to save post.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading) {
        return <Skeleton className="h-screen w-full" />
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">{postId ? 'Edit Post' : 'Create New Post'}</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleSave('Draft')} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 animate-spin" /> : null}
                        Save Draft
                    </Button>
                    <Button onClick={() => handleSave('Published')} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 animate-spin" /> : null}
                        Publish
                    </Button>
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-lg">Post Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your engaging blog post title" className="text-2xl h-14 font-bold" />
                </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="author">Author</Label>
                        <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label>Featured Image</Label>
                         <ImageUpload imageUrl={featuredImageUrl} onFileSelect={setFeaturedImage} />
                    </div>
                 </div>

                <div className="space-y-4">
                    <Label className="text-lg">Content</Label>
                    {content.map((block, index) => (
                        <div key={block.id} className="flex items-start gap-2 group">
                             <GripVertical className="mt-9 h-5 w-5 text-muted-foreground" />
                             <div className="flex-grow">
                                {block.type === 'text' ? (
                                    <Textarea
                                        value={block.value}
                                        onChange={(e) => updateContentBlock(block.id, e.target.value)}
                                        placeholder="Start writing..."
                                        rows={5}
                                        className="text-base"
                                    />
                                ) : block.type === 'image' ? (
                                    <ImageUpload
                                        imageUrl={block.value}
                                        onFileSelect={(file) => handleBlockImageUpload(block.id, file)}
                                    />
                                ) : block.type === 'video' ? (
                                    <Input
                                        value={block.value}
                                        onChange={(e) => updateContentBlock(block.id, e.target.value)}
                                        placeholder="Enter YouTube or Vimeo video URL"
                                        className="text-base"
                                    />
                                ) : null}
                             </div>
                             <Button variant="ghost" size="icon" className="mt-8 text-destructive opacity-0 group-hover:opacity-100" onClick={() => removeContentBlock(block.id)}>
                                <Trash2 />
                             </Button>
                        </div>
                    ))}
                    <div className="flex gap-2 justify-center border-t pt-4">
                        <Button variant="outline" onClick={() => addContentBlock('text')}><Plus className="mr-2"/> Add Text</Button>
                        <Button variant="outline" onClick={() => addContentBlock('image')}><Upload className="mr-2"/> Add Image</Button>
                        <Button variant="outline" onClick={() => addContentBlock('video')}><Video className="mr-2"/> Add Video</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function NewPostPage() {
    return (
        <React.Suspense fallback={<Skeleton className="h-screen w-full" />}>
            <NewPostPageContent />
        </React.Suspense>
    );
}
