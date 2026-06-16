import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // <-- ADD THIS

const firebaseConfig = {
  apiKey: "AIzaSyAh_IF-Jfml2IlU445PL8RI_kRB1YVjCJU",
  authDomain: "spare-pro.firebaseapp.com",
  projectId: "spare-pro",
  storageBucket: "spare-pro.firebasestorage.app", // <-- THIS IS CRITICAL FOR PHOTOS
  messagingSenderId: "145184069737",
  appId: "1:145184069737:web:976e41d40ca08f39356af8",
  measurementId: "G-9N2T0EDKQH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app); // <-- ADD THIS