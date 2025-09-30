import admin from 'firebase-admin';
import fs from 'fs';

let firestore = null;

export function initFirebase() {
  if (firestore) return firestore;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const credPath = process.env.FIREBASE_CREDENTIALS;
  if (!projectId || !credPath) return null;
  const credential = JSON.parse(fs.readFileSync(credPath, 'utf8'));
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(credential), projectId });
  }
  firestore = admin.firestore();
  return firestore;
}

export function hasFirebase() {
  return Boolean(initFirebase());
}

export function getFirestore() { return initFirebase(); }


