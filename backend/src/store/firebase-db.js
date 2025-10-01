import { getFirestore, hasFirebase } from './firebase.js';
import { all, get, run } from './db.js';

// Firebase Collections
const COLLECTIONS = {
  services: 'services',
  os: 'os',
  os_items: 'os_items',
  finance_income: 'finance_income',
  finance_expense: 'finance_expense',
  tickets: 'tickets',
  settings: 'settings'
};

// Helper functions
function convertFirebaseDoc(doc) {
  return { id: doc.id, ...doc.data() };
}

function convertFirebaseDocs(docs) {
  return docs.map(convertFirebaseDoc);
}

// Generic CRUD operations
export async function firebaseAll(collection, query = null) {
  if (!hasFirebase()) {
    return all(`SELECT * FROM ${collection} ORDER BY created_at DESC`);
  }
  
  try {
    const firestore = getFirestore();
    let firebaseQuery = firestore.collection(collection);
    
    if (query) {
      // Apply query conditions
      Object.entries(query).forEach(([field, value]) => {
        firebaseQuery = firebaseQuery.where(field, '==', value);
      });
    }
    
    const snapshot = await firebaseQuery.orderBy('created_at', 'desc').get();
    return convertFirebaseDocs(snapshot.docs);
  } catch (error) {
    console.error(`Firebase error in ${collection}:`, error);
    // Fallback to SQLite
    return all(`SELECT * FROM ${collection} ORDER BY created_at DESC`);
  }
}

export async function firebaseGet(collection, id) {
  if (!hasFirebase()) {
    return get(`SELECT * FROM ${collection} WHERE id = @id`, { id });
  }
  
  try {
    const firestore = getFirestore();
    const doc = await firestore.collection(collection).doc(id.toString()).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return convertFirebaseDoc(doc);
  } catch (error) {
    console.error(`Firebase error getting ${collection}/${id}:`, error);
    // Fallback to SQLite
    return get(`SELECT * FROM ${collection} WHERE id = @id`, { id });
  }
}

export async function firebaseCreate(collection, data) {
  if (!hasFirebase()) {
    const fields = Object.keys(data).join(',');
    const values = Object.keys(data).map(() => '@' + Object.keys(data).join(',@')).join(',');
    run(`INSERT INTO ${collection} (${fields}) VALUES (${values})`, data);
    return get(`SELECT * FROM ${collection} WHERE id = last_insert_rowid()`);
  }
  
  try {
    const firestore = getFirestore();
    const docRef = await firestore.collection(collection).add({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    const doc = await docRef.get();
    return convertFirebaseDoc(doc);
  } catch (error) {
    console.error(`Firebase error creating ${collection}:`, error);
    // Fallback to SQLite
    const fields = Object.keys(data).join(',');
    const values = Object.keys(data).map(() => '@' + Object.keys(data).join(',@')).join(',');
    run(`INSERT INTO ${collection} (${fields}) VALUES (${values})`, data);
    return get(`SELECT * FROM ${collection} WHERE id = last_insert_rowid()`);
  }
}

export async function firebaseUpdate(collection, id, data) {
  if (!hasFirebase()) {
    const fields = Object.keys(data).map(field => `${field} = @${field}`).join(',');
    run(`UPDATE ${collection} SET ${fields} WHERE id = @id`, { ...data, id });
    return get(`SELECT * FROM ${collection} WHERE id = @id`, { id });
  }
  
  try {
    const firestore = getFirestore();
    await firestore.collection(collection).doc(id.toString()).update({
      ...data,
      updated_at: new Date().toISOString()
    });
    
    const doc = await firestore.collection(collection).doc(id.toString()).get();
    return convertFirebaseDoc(doc);
  } catch (error) {
    console.error(`Firebase error updating ${collection}/${id}:`, error);
    // Fallback to SQLite
    const fields = Object.keys(data).map(field => `${field} = @${field}`).join(',');
    run(`UPDATE ${collection} SET ${fields} WHERE id = @id`, { ...data, id });
    return get(`SELECT * FROM ${collection} WHERE id = @id`, { id });
  }
}

export async function firebaseDelete(collection, id) {
  if (!hasFirebase()) {
    run(`DELETE FROM ${collection} WHERE id = @id`, { id });
    return true;
  }
  
  try {
    const firestore = getFirestore();
    await firestore.collection(collection).doc(id.toString()).delete();
    return true;
  } catch (error) {
    console.error(`Firebase error deleting ${collection}/${id}:`, error);
    // Fallback to SQLite
    run(`DELETE FROM ${collection} WHERE id = @id`, { id });
    return true;
  }
}

// Specific operations for each collection
export const FirebaseServices = {
  list: () => firebaseAll(COLLECTIONS.services),
  create: (data) => firebaseCreate(COLLECTIONS.services, data),
  update: (id, data) => firebaseUpdate(COLLECTIONS.services, id, data),
  delete: (id) => firebaseDelete(COLLECTIONS.services, id)
};

export const FirebaseOrders = {
  list: () => firebaseAll(COLLECTIONS.os),
  get: (id) => firebaseGet(COLLECTIONS.os, id),
  create: (data) => firebaseCreate(COLLECTIONS.os, data),
  update: (id, data) => firebaseUpdate(COLLECTIONS.os, id, data),
  delete: (id) => firebaseDelete(COLLECTIONS.os, id),
  setItems: async (id, items) => {
    if (!hasFirebase()) {
      // SQLite implementation
      run(`DELETE FROM ${COLLECTIONS.os_items} WHERE os_id = @id`, { id });
      items.forEach(item => {
        run(`INSERT INTO ${COLLECTIONS.os_items} (os_id, type, description, qty, unit_cost, unit_price, total) 
             VALUES (@os_id, @type, @description, @qty, @unit_cost, @unit_price, @total)`, 
             { ...item, os_id: id });
      });
      return items;
    }
    
    try {
      const firestore = getFirestore();
      const batch = firestore.batch();
      
      // Delete existing items
      const existingItems = await firestore.collection(COLLECTIONS.os_items)
        .where('os_id', '==', id).get();
      
      existingItems.docs.forEach(doc => batch.delete(doc.ref));
      
      // Add new items
      items.forEach(item => {
        const itemRef = firestore.collection(COLLECTIONS.os_items).doc();
        batch.set(itemRef, {
          ...item,
          os_id: id,
          created_at: new Date().toISOString()
        });
      });
      
      await batch.commit();
      return items;
    } catch (error) {
      console.error('Firebase error setting OS items:', error);
      // Fallback to SQLite
      run(`DELETE FROM ${COLLECTIONS.os_items} WHERE os_id = @id`, { id });
      items.forEach(item => {
        run(`INSERT INTO ${COLLECTIONS.os_items} (os_id, type, description, qty, unit_cost, unit_price, total) 
             VALUES (@os_id, @type, @description, @qty, @unit_cost, @unit_price, @total)`, 
             { ...item, os_id: id });
      });
      return items;
    }
  }
};

export const FirebaseFinance = {
  incomeList: () => firebaseAll(COLLECTIONS.finance_income),
  incomeCreate: (data) => firebaseCreate(COLLECTIONS.finance_income, data),
  expenseList: () => firebaseAll(COLLECTIONS.finance_expense),
  expenseCreate: (data) => firebaseCreate(COLLECTIONS.finance_expense, data),
  expenseUpdate: (id, data) => firebaseUpdate(COLLECTIONS.finance_expense, id, data),
  expenseDelete: (id) => firebaseDelete(COLLECTIONS.finance_expense, id),
  dashboard: async (month) => {
    const [y, m] = month ? month.split('-').map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
    const start = `${y}-${String(m).padStart(2,'0')}-01`;
    const end = `${y}-${String(m).padStart(2,'0')}-31`;
    
    if (!hasFirebase()) {
      // SQLite implementation
      const incomes = all('SELECT * FROM finance_income WHERE date BETWEEN @start AND @end', { start, end });
      const expenses = all('SELECT * FROM finance_expense WHERE date BETWEEN @start AND @end', { start, end });
      const revenue = incomes.reduce((s, i) => s + i.net, 0);
      const cost = expenses.reduce((s, e) => s + e.amount, 0);
      const profit = revenue - cost;
      const avgTicket = incomes.length ? revenue / incomes.length : 0;
      
      return { revenue, cost, profit, avgTicket, incomes, expenses };
    }
    
    try {
      const firestore = getFirestore();
      
      // Get incomes
      const incomesSnapshot = await firestore.collection(COLLECTIONS.finance_income)
        .where('date', '>=', start)
        .where('date', '<=', end)
        .get();
      const incomes = convertFirebaseDocs(incomesSnapshot.docs);
      
      // Get expenses
      const expensesSnapshot = await firestore.collection(COLLECTIONS.finance_expense)
        .where('date', '>=', start)
        .where('date', '<=', end)
        .get();
      const expenses = convertFirebaseDocs(expensesSnapshot.docs);
      
      const revenue = incomes.reduce((s, i) => s + i.net, 0);
      const cost = expenses.reduce((s, e) => s + e.amount, 0);
      const profit = revenue - cost;
      const avgTicket = incomes.length ? revenue / incomes.length : 0;
      
      return { revenue, cost, profit, avgTicket, incomes, expenses };
    } catch (error) {
      console.error('Firebase error getting dashboard:', error);
      // Fallback to SQLite
      const incomes = all('SELECT * FROM finance_income WHERE date BETWEEN @start AND @end', { start, end });
      const expenses = all('SELECT * FROM finance_expense WHERE date BETWEEN @start AND @end', { start, end });
      const revenue = incomes.reduce((s, i) => s + i.net, 0);
      const cost = expenses.reduce((s, e) => s + e.amount, 0);
      const profit = revenue - cost;
      const avgTicket = incomes.length ? revenue / incomes.length : 0;
      
      return { revenue, cost, profit, avgTicket, incomes, expenses };
    }
  }
};

export const FirebaseTickets = {
  list: () => firebaseAll(COLLECTIONS.tickets),
  create: (data) => firebaseCreate(COLLECTIONS.tickets, data),
  update: (id, data) => firebaseUpdate(COLLECTIONS.tickets, id, data),
  delete: (id) => firebaseDelete(COLLECTIONS.tickets, id)
};

export const FirebaseSettings = {
  get: async () => {
    if (!hasFirebase()) {
      return get('SELECT * FROM settings WHERE id = 1');
    }
    
    try {
      const firestore = getFirestore();
      const doc = await firestore.collection(COLLECTIONS.settings).doc('1').get();
      
      if (!doc.exists) {
        // Create default settings
        const defaultSettings = {
          hourly_rate: 80,
          margin_pct: 30,
          tax_pct: 8,
          card_fee_pct: 2.5,
          urgency_multiplier: 1.25,
          oncall_multiplier: 1.5
        };
        
        await firestore.collection(COLLECTIONS.settings).doc('1').set(defaultSettings);
        return { id: '1', ...defaultSettings };
      }
      
      return convertFirebaseDoc(doc);
    } catch (error) {
      console.error('Firebase error getting settings:', error);
      return get('SELECT * FROM settings WHERE id = 1');
    }
  },
  update: async (data) => {
    if (!hasFirebase()) {
      const fields = Object.keys(data).map(field => `${field} = @${field}`).join(',');
      run(`UPDATE settings SET ${fields} WHERE id = 1`, data);
      return get('SELECT * FROM settings WHERE id = 1');
    }
    
    try {
      const firestore = getFirestore();
      await firestore.collection(COLLECTIONS.settings).doc('1').update(data);
      
      const doc = await firestore.collection(COLLECTIONS.settings).doc('1').get();
      return convertFirebaseDoc(doc);
    } catch (error) {
      console.error('Firebase error updating settings:', error);
      const fields = Object.keys(data).map(field => `${field} = @${field}`).join(',');
      run(`UPDATE settings SET ${fields} WHERE id = 1`, data);
      return get('SELECT * FROM settings WHERE id = 1');
    }
  }
};
