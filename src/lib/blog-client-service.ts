
'use client';

import { 
    collection, 
    onSnapshot, 
    query,
    orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import type { BlogPost } from './blog-service';

const postsCollection = collection(db, 'blogPosts');

/**
 * Sets up a real-time listener for all blog posts.
 * This is a client-side function.
 * @param callback Function to be called with the updated list of posts.
 * @returns Unsubscribe function for the listener.
 */
export function onPostsUpdate(callback: (posts: BlogPost[]) => void): () => void {
    const q = query(postsCollection, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
        callback(postsData);
    });
    return unsubscribe;
}
