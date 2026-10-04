// src/lib/firebase.ts — Firebase initialization (client-only).
// Auth + Firestore are used for accounts, profiles, crews, presence, leaderboards.

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyAzVMYDMEL3CsrkVPslgITiwZAoGeyrGz4",
  authDomain: "afrorush-7b35a.firebaseapp.com",
  projectId: "afrorush-7b35a",
  storageBucket: "afrorush-7b35a.firebasestorage.app",
  messagingSenderId: "330315373572",
  appId: "1:330315373572:web:25685919af1d0269c66951",
  measurementId: "G-07CC2DBQGZ",
};

// Lazy singletons — these are only created in the browser.
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function ensureApp(): FirebaseApp {
  if (!_app) _app = initializeApp(firebaseConfig);
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(ensureApp());
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (!_db) _db = getFirestore(ensureApp());
  return _db;
}
