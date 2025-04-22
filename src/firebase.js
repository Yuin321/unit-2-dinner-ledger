import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2JTe2c5yPzNkPKlCCpt-Cg0f5rVLuSAg",
  authDomain: "unit-2-dinner.firebaseapp.com",
  projectId: "unit-2-dinner",
  storageBucket: "unit-2-dinner.firebasestorage.app",
  messagingSenderId: "842879054812",
  appId: "1:842879054812:web:17d2981f9afce85b35d519",
  measurementId: "G-EJG526M77H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

signInAnonymously(auth)
  .then(() => {
    console.log("✅ Signed in anonymously");
  })
  .catch((error) => {
    console.error("❌ Anonymous sign-in error:", error);
  });
export { auth, db };