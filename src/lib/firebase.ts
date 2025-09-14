
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// This is intentionally left sparse, the preparer step will populate it.
const firebaseConfig = {
  "projectId": "vendorverse-rhu2g",
  "appId": "1:449199253707:web:eeb19ad71d5bc81d79934e",
  "storageBucket": "vendorverse-rhu2g.appspot.com",
  "apiKey": "AIzaSyBuVM0FSd3fZGrDzGOqdfAlpQeNZSSUzV0",
  "authDomain": "vendorverse-rhu2g.firebaseapp.com",
  "measurementId": "G-11V629000L",
  "messagingSenderId": "449199253707"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);


export { db, storage };
