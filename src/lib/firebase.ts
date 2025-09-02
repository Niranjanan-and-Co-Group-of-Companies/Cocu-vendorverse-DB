// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: 'vendorverse-rhu2g',
  appId: '1:449199253707:web:eeb19ad71d5bc81d79934e',
  storageBucket: 'vendorverse-rhu2g.appspot.com',
  apiKey: 'AIzaSyBuVM0FSd3fZGrDzGOqdfAlpQeNZSSUzV0',
  authDomain: 'vendorverse-rhu2g.firebaseapp.com',
  databaseURL: "https://vendorverse-rhu2g.firebaseio.com",
  measurementId: '',
  messagingSenderId: '449199253707',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);


export { db, storage };
