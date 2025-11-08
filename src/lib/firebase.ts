// Firebase initializer - reads config from Vite env variables
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
};

let app: ReturnType<typeof initializeApp> | null = null;

export function initFirebase() {
  if (app) return app;

  // Basic validation (won't block, just helpful log)
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    // In development we want to log clearly so developers know what's missing
    // But do not throw: allow the app to run with degraded functionality
    // (calls that rely on Firebase will need to handle missing app)
    // eslint-disable-next-line no-console
    console.warn('Firebase config incomplete. Make sure VITE_FIREBASE_* variables are set.');
  }

  app = initializeApp(firebaseConfig as any);

  // Analytics is browser-only
  if (typeof window !== 'undefined') {
    try {
      getAnalytics(app);
    } catch (err) {
      // Analytics may fail in non-supported environments; ignore.
      // eslint-disable-next-line no-console
      console.info('Firebase analytics not initialized:', err?.message || err);
    }
  }

  return app;
}

export default initFirebase;
