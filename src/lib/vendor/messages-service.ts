
import { collection, onSnapshot, getDoc, doc, query, where, orderBy, Unsubscribe, updateDoc, writeBatch, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase';
import type { Product } from '../products';

// --- Data Types ---

export interface VendorConversation {
  id: string;
  vendorId: string;
  product: Pick<Product, 'id' | 'name' | 'image'>;
  lastMessage: {
    text: string;
    timestamp: any;
  };
  status: 'Active' | 'Flagged' | 'Locked';
  unreadCount: number; // For the vendor
  messageCount: number; // Total messages in conversation
}

export interface Message {
  id: string;
  senderId: string;
  senderType: 'customer' | 'vendor' | 'system';
  text: string;
  timestamp: any; // Firestore Timestamp
}


// --- Real-time Listeners ---

export function onVendorConversationsUpdate(vendorId: string, callback: (summaries: VendorConversation[]) => void): Unsubscribe {
  const q = query(
    collection(db, 'conversations'), 
    where('vendorId', '==', vendorId),
    orderBy('lastMessageTimestamp', 'desc')
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const productCache = new Map<string, Pick<Product, 'id' | 'name' | 'image'>>();

    const getProduct = async (productId: string): Promise<Pick<Product, 'id' | 'name' | 'image'>> => {
      if (productCache.has(productId)) {
        return productCache.get(productId)!;
      }
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const productData = productSnap.data() as Product;
        const productInfo: Pick<Product, 'id' | 'name' | 'image'> = { id: productData.id, name: productData.name, image: productData.image };
        productCache.set(productId, productInfo);
        return productInfo;
      }
      return { id: parseInt(productId, 10), name: 'Unknown Product', image: '' };
    };

    const summariesPromises = snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      const product = await getProduct(data.productId);
      
      return {
        id: docSnap.id,
        vendorId: data.vendorId,
        product,
        lastMessage: {
          text: data.lastMessageText || 'No messages yet',
          timestamp: data.lastMessageTimestamp
        },
        status: data.status,
        unreadCount: data.vendorUnreadCount || 0,
        messageCount: data.messageCount || 0,
      } as VendorConversation;
    });
    
    const summaries = await Promise.all(summariesPromises);
    callback(summaries);
  }, (error) => {
    console.error("Error fetching vendor conversations:", error);
    callback([]);
  });

  return unsubscribe;
}

export function onMessagesUpdate(conversationId: string, callback: (messages: Message[]) => void): Unsubscribe {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Message));
    callback(messages);
  });

  return unsubscribe;
}


// --- Mutation Functions ---

export async function markConversationAsRead(conversationId: string) {
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, { vendorUnreadCount: 0 });
}

export async function sendMessage(conversationId: string, senderId: string, senderType: 'vendor' | 'customer', text: string) {
    const batch = writeBatch(db);
    
    // 1. Add new message to subcollection
    const messageRef = doc(collection(db, 'conversations', conversationId, 'messages'));
    batch.set(messageRef, {
        senderId,
        senderType,
        text,
        timestamp: serverTimestamp(),
    });

    // 2. Update parent conversation document
    const convRef = doc(db, 'conversations', conversationId);
    batch.update(convRef, {
        lastMessageText: text,
        lastMessageTimestamp: serverTimestamp(),
        messageCount: increment(1),
        // If vendor sends, increment customer unread count
        ...(senderType === 'vendor' && { customerUnreadCount: increment(1) })
    });

    await batch.commit();
}


export async function updateConversationStatus(conversationId: string, status: 'Active' | 'Locked' | 'Flagged') {
  const convRef = doc(db, 'conversations', conversationId);
  await updateDoc(convRef, { status });
}
