

'use server';

import { 
    collection, 
    onSnapshot, 
    getDoc, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    serverTimestamp,
    query,
    orderBy,
    where,
    getDocs,
    limit,
    Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

export type ContentBlock = {
    id: string;
    type: 'text' | 'image';
    value: string;
};

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  featuredImage: string;
  content: ContentBlock[];
  status: 'Published' | 'Draft';
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

const postsCollection = collection(db, 'blogPosts');

// --- Service Functions ---

export async function getPublishedPosts(): Promise<BlogPost[]> {
    const q = query(postsCollection, where('status', '==', 'Published'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    const q = query(postsCollection, where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BlogPost;
}

export async function getPostById(id: string): Promise<BlogPost | null> {
    const docRef = doc(db, 'blogPosts', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as BlogPost;
    }
    return null;
}

async function uploadFile(path: string, file: File): Promise<string> {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}

export async function savePost(data: Partial<BlogPost> & { featuredImage: File | null; imageFiles: Record<string, File | null> }) {
    const { id, featuredImage, imageFiles, ...postData } = data;
    const isNewPost = !id;

    const slug = postData.title!.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    let featuredImageUrl = (postData as BlogPost).featuredImage || '';
    if (featuredImage) {
        featuredImageUrl = await uploadFile(`blog/${slug}/featured_${featuredImage.name}`, featuredImage);
    }
    
    const content = await Promise.all(
        (postData.content || []).map(async (block) => {
            if (block.type === 'image' && imageFiles[block.id]) {
                const file = imageFiles[block.id]!;
                const imageUrl = await uploadFile(`blog/${slug}/${block.id}_${file.name}`, file);
                return { ...block, value: imageUrl };
            }
            return block;
        })
    );

    const finalData = {
        ...postData,
        slug,
        featuredImage: featuredImageUrl,
        content,
        updatedAt: serverTimestamp(),
        ...(isNewPost && { createdAt: serverTimestamp() })
    };

    if (isNewPost) {
        await addDoc(postsCollection, finalData);
    } else {
        await updateDoc(doc(postsCollection, id), finalData);
    }
}

export async function updatePostStatus(postId: string, status: 'Published' | 'Draft') {
    await updateDoc(doc(postsCollection, postId), { status, updatedAt: serverTimestamp() });
}

export async function deletePost(postId: string) {
    // Note: Deleting images from storage is complex and often handled by a separate background function.
    // For this implementation, we will just delete the Firestore document.
    await deleteDoc(doc(postsCollection, postId));
}
