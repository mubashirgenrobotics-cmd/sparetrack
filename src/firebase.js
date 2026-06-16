import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAh_IF-Jfml2IlU445PL8RI_kRB1YVjCJU",
  authDomain: "spare-pro.firebaseapp.com",
  projectId: "spare-pro",
  storageBucket: "spare-pro.firebasestorage.app",
  messagingSenderId: "145184069737",
  appId: "1:145184069737:web:976e41d40ca08f39356af8",
  measurementId: "G-9N2T0EDKQH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the database so App.jsx can use it
export const db = getFirestore(app);