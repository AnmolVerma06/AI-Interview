import { initializeApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  setDoc, 
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6WMC4BdlcxbZL5B7ft6UFMcldQJ6c2XM",
  authDomain: "ai-interview-26b13.firebaseapp.com",
  projectId: "ai-interview-26b13",
  storageBucket: "ai-interview-26b13.firebasestorage.app",
  messagingSenderId: "919151084160",
  appId: "1:919151084160:web:fded85650fa3aef1769c65",
  measurementId: "G-WEDX7Z6YE5"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export {
  db,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  type DocumentData,
  type QueryDocumentSnapshot
};
