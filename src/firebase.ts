import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtq8yWB5R8qGEfcS2-Vx-qR46oyqNftyQ",
  authDomain: "cashout-2444e.firebaseapp.com",
  projectId: "cashout-2444e",
  storageBucket: "cashout-2444e.firebasestorage.app",
  messagingSenderId: "77580678753",
  appId: "1:77580678753:web:56c309767142bd2e875c20",
  measurementId: "G-KQ4ZSPX2RR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);