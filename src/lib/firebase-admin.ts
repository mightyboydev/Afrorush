// src/lib/firebase-admin.ts — Server-side Firebase Admin SDK.
// Used by API routes for trusted operations (money, bans, catalog).
// NEVER import this in client code — it uses service account credentials.

import { initializeApp, getApps, cert, type App as AdminApp } from "firebase-admin/app";
import { getAuth as adminGetAuth, type Auth as AdminAuth } from "firebase-admin/auth";
import { getFirestore as adminGetFirestore, type Firestore as AdminFirestore } from "firebase-admin/firestore";

let _app: AdminApp | null = null;
let _auth: AdminAuth | null = null;
let _db: AdminFirestore | null = null;

function ensureApp(): AdminApp {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApps()[0]!;
    return _app;
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error(
      "Firebase Admin SDK env vars missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY."
    );
  }
  // Support \n literal in env (Vercel stores newlines as \n).
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  _app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
  return _app;
}

export function getAdminAuth(): AdminAuth {
  if (!_auth) _auth = adminGetAuth(ensureApp());
  return _auth;
}

export function getAdminDb(): AdminFirestore {
  if (!_db) _db = adminGetFirestore(ensureApp());
  return _db;
}

// Verify a Firebase ID token and check for admin custom claim.
export async function verifyAdminToken(idToken: string): Promise<{ uid: string; admin: boolean; role: string | null } | null> {
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const admin = (decoded.admin === true) || (decoded.role === "owner" || decoded.role === "admin" || decoded.role === "moderator");
    return { uid: decoded.uid, admin: !!decoded.admin, role: (decoded.role as string) ?? null };
  } catch {
    return null;
  }
}

// Check if a user has a specific admin role.
export async function getUserRole(uid: string): Promise<"owner" | "admin" | "moderator" | null> {
  try {
    const user = await getAdminAuth().getUser(uid);
    const role = user.customClaims?.role as string | undefined;
    if (role === "owner" || role === "admin" || role === "moderator") return role;
    return null;
  } catch {
    return null;
  }
}

// Set admin custom claim on a user (only owners can do this).
export async function setAdminRole(uid: string, role: "owner" | "admin" | "moderator"): Promise<void> {
  await getAdminAuth().setCustomUserClaims(uid, { admin: true, role });
}

// Remove admin role from a user.
export async function removeAdminRole(uid: string): Promise<void> {
  await getAdminAuth().setCustomUserClaims(uid, { admin: false, role: null });
}
