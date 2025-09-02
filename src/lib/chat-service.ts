
import { collection, onSnapshot, getDocs, writeBatch, doc, query, orderBy, getDoc, updateDoc, Unsubscribe, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

// --- Data Types ---

export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
}

export interface ConversationSummary {
  id: string;
  type: 'Customer' | 'Corporate';
  participants: {
    customer: UserInfo;
    vendor: UserInfo;
  };
  lastMessage: {
    text: string;
    timestamp: any;
  };
  status: 'Active' | 'Flagged' | 'Locked';
  unreadCount: number;
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
  { id: 'conv001', type: 'Customer', customerId: 'user001', vendorId: 'vendor001', status: 'Active', unreadCount: 2 },
  { id: 'conv002', type: 'Corporate', customerId: 'user002', vendorId: 'vendor002', status: 'Flagged', unreadCount: 0 },
  { id: 'conv003', type: 'Customer', customerId: 'user003', vendorId: 'vendor001', status: 'Locked', unreadCount: 0 },
  { id: 'conv004', type: 'Customer', customerId: 'user004', vendorId: 'vendor003', status: 'Active', unreadCount: 0 },
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
      batch.set(convRef, { type: conv.type, customerId: conv.customerId, vendorId: conv.vendorId, status: conv.status });
      
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

// --- Service Functions ---

// Fetch enriched conversations
export function onConversationsUpdate(callback: (summaries: ConversationSummary[]) => void): Unsubscribe {
  seedChatData();
  const q = query(collection(db, 'conversations'), orderBy('lastMessageTimestamp', 'desc'));

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const userCache = new Map<string, UserInfo>();

    const getUser = async (userId: string): Promise<UserInfo> => {
      if (userCache.has(userId)) {
        return userCache.get(userId)!;
      }
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const userInfo: UserInfo = { id: userId, name: userData.name, avatar: userData.avatar };
        userCache.set(userId, userInfo);
        return userInfo;
      }
      // Fallback for vendors or missing users
      const vendorRef = doc(db, 'vendors', userId);
      const vendorSnap = await getDoc(vendorRef);
       if (vendorSnap.exists()) {
        const vendorData = vendorSnap.data();
        const vendorInfo: UserInfo = { id: userId, name: vendorData.name, avatar: vendorData.avatar };
        userCache.set(userId, vendorInfo);
        return vendorInfo;
      }
      return { id: userId, name: 'Unknown User', avatar: '' };
    };

    const summariesPromises = snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      const [customer, vendor] = await Promise.all([
        getUser(data.customerId),
        getUser(data.vendorId)
      ]);
      
      return {
        id: docSnap.id,
        type: data.type,
        participants: { customer, vendor },
        lastMessage: {
          text: data.lastMessageText || 'No messages yet',
          timestamp: data.lastMessageTimestamp
        },
        status: data.status,
        unreadCount: Math.floor(Math.random() * 3) // Mock unread count
      } as ConversationSummary;
    });
    
    const summaries = await Promise.all(summariesPromises);
    callback(summaries);
  });

  return unsubscribe;
}

// Fetch messages for a specific conversation
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

// Update conversation status
export async function updateConversationStatus(conversationId: string, status: 'Active' | 'Locked') {
  const convRef = doc(db, 'conversations', conversationId);
  await updateDoc(convRef, { status });
}
