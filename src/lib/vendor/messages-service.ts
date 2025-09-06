

import { collection, onSnapshot, getDoc, doc, query, where, orderBy, Unsubscribe, updateDoc, writeBatch, serverTimestamp, increment, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { Product } from '../products';

// --- Data Types ---

export interface VendorConversation {
  id: string;
  vendorId: string;
  type: 'Customer' | 'Corporate'; // Added type for filtering
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


// --- Seeding Logic ---
const MOCK_CONVERSATIONS = [
  { id: 'conv001', type: 'Customer', customerId: 'user001', vendorId: 'vendor001', status: 'Active', vendorUnreadCount: 2, customerUnreadCount: 0, productId: '1', messageCount: 4 },
  { id: 'conv002', type: 'Corporate', customerId: 'user002', vendorId: 'vendor002', status: 'Flagged', vendorUnreadCount: 0, customerUnreadCount: 0, productId: '3', messageCount: 3 },
  { id: 'conv003', type: 'Customer', customerId: 'user003', vendorId: 'vendor001', status: 'Locked', vendorUnreadCount: 0, customerUnreadCount: 0, productId: '4', messageCount: 3 },
  { id: 'conv004', type: 'Customer', customerId: 'user004', vendorId: 'vendor003', status: 'Active', vendorUnreadCount: 1, customerUnreadCount: 1, productId: '8', messageCount: 1 },
];

const MOCK_MESSAGES: { [key: string]: Omit<Message, 'id'>[] } = {
  'conv001': [
    { senderId: 'user001', senderType: 'customer', text: 'Hi, I have a question about my order.', timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 10)) },
    { senderId: 'vendor001', senderType: 'vendor', text: 'Hello! I can help with that. What is your order number?', timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 9)) },
    { senderId: 'user001', senderType: 'customer', text: 'It is #12345.', timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 8)) },
    { senderId: 'user001', senderType: 'customer', text: 'Can you give me an update?', timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 2)) },
  ],
  'conv002': [
    { senderId: 'user002', senderType: 'customer', text: 'I need a bulk order of 500 custom wallets. What is your best price?', timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 2)) },
    { senderId: 'vendor002', senderType: 'vendor', text: 'For that quantity, we can offer a significant discount. Let me prepare a quote.', timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 1)) },
    { senderId: 'user002', senderType: 'customer', text: 'The branding needs to be perfect.', timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 30)) },
  ],
  'conv003': [
    { senderId: 'user003', senderType: 'customer', text: 'My coffee arrived cold!', timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)) },
    { senderId: 'vendor001', senderType: 'vendor', text: 'I am so sorry to hear that. That is not our standard.', timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 10000)) },
    { senderId: 'system', senderType: 'system', text: 'This conversation has been locked by an administrator.', timestamp: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)) },
  ],
  'conv004': [
    { senderId: 'vendor003', senderType: 'vendor', text: 'Thank you for your order! We are preparing your custom star map now.', timestamp: Timestamp.fromDate(new Date()) },
  ]
};

async function seedChatData() {
  const conversationsRef = collection(db, 'conversations');
  const snapshot = await getDocs(conversationsRef);

  if (snapshot.empty) {
    const batch = writeBatch(db);
    
    MOCK_CONVERSATIONS.forEach(conv => {
      const convRef = doc(db, 'conversations', conv.id);
      batch.set(convRef, { 
          type: conv.type, 
          customerId: conv.customerId, 
          vendorId: conv.vendorId, 
          productId: conv.productId,
          status: conv.status,
          vendorUnreadCount: conv.vendorUnreadCount,
          customerUnreadCount: conv.customerUnreadCount,
          messageCount: conv.messageCount,
      });
      
      const messages = MOCK_MESSAGES[conv.id] || [];
      messages.forEach((msg, index) => {
        const msgRef = doc(collection(convRef, 'messages'));
        batch.set(msgRef, msg);
        // Set the last message for the conversation summary
        if (index === messages.length - 1) {
          batch.update(convRef, { lastMessageText: msg.text, lastMessageTimestamp: msg.timestamp });
        }
      });
    });

    await batch.commit();
  }
}

// --- Real-time Listeners ---

export function onVendorConversationsUpdate(vendorId: string, callback: (summaries: VendorConversation[]) => void): Unsubscribe {
  seedChatData();
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
        type: data.type || 'Customer', // Default to 'Customer' for old data
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
