// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwy2NZ-O9GyY8Krl7fD1edcnLl4ldMD1g",
  authDomain: "dinex-74c2b.firebaseapp.com",
  projectId: "dinex-74c2b",
  storageBucket: "dinex-74c2b.firebasestorage.app",
  messagingSenderId: "668351217310",
  appId: "1:668351217310:web:6f7044f82b7f4bd35d058f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
