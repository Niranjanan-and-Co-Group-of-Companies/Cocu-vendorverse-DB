
import { collection, onSnapshot, getDocs, writeBatch, doc, serverTimestamp, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CorporateClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  contactPerson: string;
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: any; // Firestore Timestamp
  totalSpent: number;
  gstin?: string;
  gstStatus?: 'Verified' | 'Pending' | 'Failed' | 'Not Provided';
}

const MOCK_CLIENTS: Omit<CorporateClient, 'id' | 'createdAt'>[] = [
    {
        name: 'Globex Corporation',
        email: 'contact@globex.com',
        phone: '555-0101',
        contactPerson: 'John Smith',
        status: 'Active',
        totalSpent: 12500.50,
        gstin: '29ABCDE1234F1Z5',
        gstStatus: 'Verified',
    },
    {
        name: 'Stark Industries',
        email: 'info@stark-industries.net',
        phone: '555-0102',
        contactPerson: 'Pepper Potts',
        status: 'Active',
        totalSpent: 89000.00,
        gstStatus: 'Not Provided',
    },
     {
        name: 'Wayne Enterprises',
        email: 'bruce@wayne-enterprises.com',
        phone: '555-0103',
        contactPerson: 'Lucius Fox',
        status: 'Inactive',
        totalSpent: 4500.00,
        gstStatus: 'Verified',
    },
     {
        name: 'Cyberdyne Systems',
        email: 'miles.dyson@cyberdyne.io',
        phone: '555-0104',
        contactPerson: 'Miles Dyson',
        status: 'Pending',
        totalSpent: 0,
        gstin: '27AAAAA0000A1Z5',
        gstStatus: 'Pending',
    }
];

async function seedCorporateClients() {
    const clientsRef = collection(db, "corporateClients");
    const snapshot = await getDocs(clientsRef);
    if (snapshot.empty) {
        console.log("Seeding corporate clients...");
        const batch = writeBatch(db);
        MOCK_CLIENTS.forEach(client => {
            const docRef = doc(clientsRef);
            batch.set(docRef, { ...client, createdAt: serverTimestamp() });
        });
        await batch.commit();
    }
}


export function onCorporateClientsUpdate(callback: (clients: CorporateClient[]) => void): () => void {
    const clientsRef = collection(db, 'corporateClients');
    seedCorporateClients();

    const unsubscribe = onSnapshot(clientsRef, (snapshot) => {
        const clients = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as CorporateClient));
        callback(clients);
    });

    return unsubscribe;
}

export async function addCorporateClient(client: Omit<CorporateClient, 'id' | 'createdAt' | 'status' | 'totalSpent'>) {
    await addDoc(collection(db, 'corporateClients'), {
        ...client,
        status: 'Active',
        totalSpent: 0,
        gstStatus: client.gstin ? 'Pending' : 'Not Provided',
        createdAt: serverTimestamp()
    });
}


export async function updateCorporateClient(id: string, data: Partial<Omit<CorporateClient, 'id' | 'createdAt' | 'status' | 'totalSpent'>>) {
    const clientRef = doc(db, 'corporateClients', id);
    await updateDoc(clientRef, data);
}

export async function deleteCorporateClient(id: string) {
    const clientRef = doc(db, 'corporateClients', id);
    await deleteDoc(clientRef);
}
