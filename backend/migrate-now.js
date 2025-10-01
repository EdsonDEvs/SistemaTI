import { initFirebase, hasFirebase } from './src/store/firebase.js';
import { all } from './src/store/db.js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: './.env' });

async function migrateNow() {
  console.log('🔥 Iniciando migração para Firebase...');
  
  if (!hasFirebase()) {
    console.log('❌ Firebase não configurado');
    return;
  }
  
  console.log('✅ Firebase configurado. Iniciando migração...');
  
  try {
    const firestore = initFirebase();
    
    // Migrar Services
    console.log('🔧 Migrando serviços...');
    const services = all('SELECT * FROM services');
    for (const service of services) {
      const serviceData = { ...service };
      delete serviceData.id; // Firebase gera novo ID
      await firestore.collection('services').add({
        ...serviceData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    console.log(`✅ ${services.length} serviços migrados`);
    
    // Migrar Finance Income
    console.log('💰 Migrando receitas...');
    const incomes = all('SELECT * FROM finance_income');
    for (const income of incomes) {
      const incomeData = { ...income };
      delete incomeData.id;
      await firestore.collection('finance_income').add({
        ...incomeData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    console.log(`✅ ${incomes.length} receitas migradas`);
    
    // Migrar Finance Expenses
    console.log('💸 Migrando despesas...');
    const expenses = all('SELECT * FROM finance_expense');
    for (const expense of expenses) {
      const expenseData = { ...expense };
      delete expenseData.id;
      await firestore.collection('finance_expense').add({
        ...expenseData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    console.log(`✅ ${expenses.length} despesas migradas`);
    
    // Migrar Orders
    console.log('📄 Migrando ordens de serviço...');
    const orders = all('SELECT * FROM os');
    for (const order of orders) {
      const orderData = { ...order };
      delete orderData.id;
      const docRef = await firestore.collection('os').add({
        ...orderData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Migrar itens da OS
      const items = all('SELECT * FROM os_items WHERE os_id = ?', [order.id]);
      for (const item of items) {
        await firestore.collection('os_items').add({
          ...item,
          os_id: docRef.id,
          created_at: new Date().toISOString()
        });
      }
    }
    console.log(`✅ ${orders.length} ordens migradas`);
    
    // Migrar Tickets
    console.log('🎫 Migrando chamados...');
    const tickets = all('SELECT * FROM tickets');
    for (const ticket of tickets) {
      const ticketData = { ...ticket };
      delete ticketData.id;
      await firestore.collection('tickets').add({
        ...ticketData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    console.log(`✅ ${tickets.length} chamados migrados`);
    
    // Migrar Settings
    console.log('📋 Migrando configurações...');
    const settings = all('SELECT * FROM settings WHERE id = 1');
    if (settings) {
      await firestore.collection('settings').doc('1').set({
        ...settings,
        updated_at: new Date().toISOString()
      });
      console.log('✅ Configurações migradas');
    }
    
    console.log('🎉 Migração concluída com sucesso!');
    console.log('📊 Resumo:');
    console.log(`   - ${services.length} serviços`);
    console.log(`   - ${orders.length} ordens de serviço`);
    console.log(`   - ${incomes.length} receitas`);
    console.log(`   - ${expenses.length} despesas`);
    console.log(`   - ${tickets.length} chamados`);
    console.log(`   - 1 configuração`);
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  }
}

migrateNow();
