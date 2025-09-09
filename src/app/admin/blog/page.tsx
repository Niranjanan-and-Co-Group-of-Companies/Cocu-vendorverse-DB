
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { onPostsUpdate, type BlogPost, updatePostStatus } from '@/lib/blog-service';
import { BlogActions } from '@/components/admin/blog/blog-actions';
import { useToast } from '@/hooks/use-toast';

export default function BlogAdminPage() {
    const [posts, setPosts] = React.useState<BlogPost[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        const unsubscribe = onPostsUpdate((data) => {
            setPosts(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (postId: string, newStatus: 'Published' | 'Draft') => {
        try {
            await updatePostStatus(postId, newStatus);
            toast({ title: 'Status Updated', description: `Post has been ${newStatus.toLowerCase()}.` });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update post status.', variant: 'destructive' });
        }
    };

    const getStatusVariant = (status: 'Published' | 'Draft') => {
        return status === 'Published' ? 'default' : 'secondary';
    };
    
    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Blog Management</h1>
                    <p className="text-muted-foreground">Create and manage content for The VendorVerse Blog.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/blog/new">
                        <PlusCircle className="mr-2" />
                        New Post
                    </Link>
                </Button>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">{post.title}</TableCell>
                                    <TableCell>{post.author}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(post.status)}>{post.status}</Badge>
                                    </TableCell>
                                    <TableCell>{formatDate(post.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <BlogActions post={post} onStatusChange={handleStatusChange} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
