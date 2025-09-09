

'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Eye, FileUp, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { type BlogPost, deletePost } from '@/lib/blog-service';
import { useToast } from '@/hooks/use-toast';

interface BlogActionsProps {
    post: BlogPost;
    onStatusChange: (postId: string, newStatus: 'Published' | 'Draft') => void;
}

export function BlogActions({ post, onStatusChange }: BlogActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deletePost(post.id);
      toast({ title: "Post Deleted", description: `"${post.title}" has been permanently removed.`, variant: "destructive" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete post.", variant: "destructive" });
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
           <Link href={`/admin/blog/new?id=${post.id}`}><Edit className="mr-2 h-4 w-4" /> Edit</Link>
        </DropdownMenuItem>
        {post.status === 'Published' && (
            <DropdownMenuItem asChild>
                <Link href={`/blog/${post.slug}`} target="_blank"><Eye className="mr-2 h-4 w-4" /> View Live Post</Link>
            </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {post.status === 'Draft' ? (
             <DropdownMenuItem onClick={() => onStatusChange(post.id, 'Published')}><FileUp className="mr-2 h-4 w-4" /> Publish</DropdownMenuItem>
        ) : (
            <DropdownMenuItem onClick={() => onStatusChange(post.id, 'Draft')}><EyeOff className="mr-2 h-4 w-4" /> Unpublish (Set to Draft)</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the post "{post.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={handleDelete}
            >
                Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
