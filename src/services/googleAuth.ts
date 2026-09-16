import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from "firebase/auth";
import firebaseConfigJson from "../../firebase-applet-config.json";

// Merge config with environment variables if available
const resolvedFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
};

// Initialize Firebase App safely
const app = getApps().length === 0 ? initializeApp(resolvedFirebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Auth Provider with requested Google Workspace scopes
export const provider = new GoogleAuthProvider();
export const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
  "https://www.googleapis.com/auth/calendar.events.readonly",
];

SCOPES.forEach((scope) => {
  provider.addScope(scope);
});

// Prompt consent & select account so user can verify Gmail, Classroom & Calendar permissions
provider.setCustomParameters({
  login_hint: "rangasmyakash@gmail.com",
  prompt: "consent select_account",
  access_type: "offline",
});

// In-memory token cache (DO NOT store in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;
let activeSignInPromise: Promise<SignInResult | null> | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Active token not present in memory for session, UI should prompt sign in
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export interface SignInResult {
  user: User;
  accessToken: string;
}

export const googleSignIn = async (): Promise<SignInResult | null> => {
  if (activeSignInPromise) {
    return activeSignInPromise;
  }

  activeSignInPromise = (async () => {
    try {
      isSigningIn = true;
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error("Google access token was not returned by identity provider.");
      }

      cachedAccessToken = credential.accessToken;
      return { user: result.user, accessToken: cachedAccessToken };
    } catch (error: any) {
      // If user closed the popup or a newer request cancelled the current popup, handle cleanly
      if (
        error.code === "auth/cancelled-popup-request" ||
        error.code === "auth/popup-closed-by-user"
      ) {
        console.warn("Sign-in cancelled or popup closed without completing authentication:", error.code);
        return null;
      }

      console.warn("Sign in notice:", error);
      let friendlyMessage = error.message || "Failed to sign in with Google";
      if (error.code === "auth/popup-blocked") {
        friendlyMessage =
          "The sign-in popup was blocked by your browser. Please allow popups for this site in your address bar or open the app in a new tab.";
      } else if (error.code === "auth/unauthorized-domain") {
        friendlyMessage =
          "Current domain is not authorized in Firebase Console. Please add this domain to Firebase Auth authorized domains or open via shared URL.";
      }
      const enhancedErr = new Error(friendlyMessage);
      (enhancedErr as any).code = error.code;
      throw enhancedErr;
    } finally {
      isSigningIn = false;
      activeSignInPromise = null;
    }
  })();

  return activeSignInPromise;
};

export const getIsSigningIn = (): boolean => isSigningIn;

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
