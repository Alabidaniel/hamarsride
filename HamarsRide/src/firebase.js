import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAFlX9Y3OZEVjeFBGKKf6e33MIk2SCod7U",
  authDomain: "hamars-ride-backend.firebaseapp.com",
  projectId: "hamars-ride-backend",
  storageBucket: "hamars-ride-backend.firebasestorage.app",
  messagingSenderId: "389692668039",
  appId: "1:389692668039:web:db1cd0adaba4fe8a576022",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Make sure the session persists across reloads
setPersistence(auth, browserLocalPersistence);

window.auth = auth;
export { app, auth };