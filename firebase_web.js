// Firebase configuration and initialization for chat app
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8fb8kv2N7_9P-flSqo8Cc4SLbVE0mSHE",
  authDomain: "chatapp-d3684.firebaseapp.com",
  projectId: "chatapp-d3684",
  storageBucket: "chatapp-d3684.firebasestorage.app",
  messagingSenderId: "795202748354",
  appId: "1:795202748354:web:714b49c25cd50b55afe05b",
};

// Initialize Firebase app (prevent multiple initializations)
let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

// Initialize Firestore database for real-time messaging
const db = getFirestore(app);

// Initialize Firebase Storage for image uploads
const storage = getStorage(app);

// For Expo Go compatibility, we'll handle auth differently
// We'll create a mock auth that works locally
const createMockAuth = () => ({
    currentUser: null,
    signInAnonymously: async () => {
        const mockUser = {
            uid: 'mock-user-' + Date.now(),
            isAnonymous: true
        };
        return { user: mockUser };
    }
});

// Use mock auth for Expo Go compatibility
const auth = createMockAuth();

console.log('Firebase initialized for Expo Go (mock auth mode)');

export { app, auth, db, storage };