import { initFirebase, hasFirebase } from './src/store/firebase.js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
const result = dotenv.config({ path: './.env' });
console.log('Dotenv result:', result);

console.log('🔍 Testando configuração do Firebase...');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CREDENTIALS:', process.env.FIREBASE_CREDENTIALS);

const firestore = initFirebase();
console.log('Firebase inicializado:', !!firestore);
console.log('hasFirebase():', hasFirebase());

if (hasFirebase()) {
  console.log('✅ Firebase configurado corretamente!');
} else {
  console.log('❌ Firebase não configurado');
}
