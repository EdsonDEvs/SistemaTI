import { initFirebase, hasFirebase } from './store/firebase.js';
import { all } from './store/db.js';
import { FirebaseServices, FirebaseOrders, FirebaseFinance, FirebaseTickets, FirebaseSettings } from './store/firebase-db.js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: './.env' });

async function migrateToFirebase() {
  console.log('🔥 Iniciando migração para Firebase...');
  
  if (!hasFirebase()) {
    console.log('❌ Firebase não configurado. Configure as variáveis de ambiente:');
    console.log('   FIREBASE_PROJECT_ID=seu-projeto-id');
    console.log('   FIREBASE_CREDENTIALS=./firebase-service-account.json');
    return;
  }
  
  console.log('✅ Firebase configurado. Iniciando migração...');
  
  try {
    // Migrar Settings
    console.log('📋 Migrando configurações...');
    const settings = all('SELECT * FROM settings WHERE id = 1');
    if (settings) {
      await FirebaseSettings.update(settings);
      console.log('✅ Configurações migradas');
    }
    
    // Migrar Services
    console.log('🔧 Migrando serviços...');
    const services = all('SELECT * FROM services');
    for (const service of services) {
      await FirebaseServices.create(service);
    }
    console.log(`✅ ${services.length} serviços migrados`);
    
    // Migrar Orders
    console.log('📄 Migrando ordens de serviço...');
    const orders = all('SELECT * FROM os');
    for (const order of orders) {
      const orderData = { ...order };
      delete orderData.id; // Firebase gera novo ID
      const newOrder = await FirebaseOrders.create(orderData);
      
      // Migrar itens da OS
      const items = all('SELECT * FROM os_items WHERE os_id = ?', [order.id]);
      if (items.length > 0) {
        await FirebaseOrders.setItems(newOrder.id, items);
      }
    }
    console.log(`✅ ${orders.length} ordens migradas`);
    
    // Migrar Finance Income
    console.log('💰 Migrando receitas...');
    const incomes = all('SELECT * FROM finance_income');
    for (const income of incomes) {
      await FirebaseFinance.incomeCreate(income);
    }
    console.log(`✅ ${incomes.length} receitas migradas`);
    
    // Migrar Finance Expenses
    console.log('💸 Migrando despesas...');
    const expenses = all('SELECT * FROM finance_expense');
    for (const expense of expenses) {
      await FirebaseFinance.expenseCreate(expense);
    }
    console.log(`✅ ${expenses.length} despesas migradas`);
    
    // Migrar Tickets
    console.log('🎫 Migrando chamados...');
    const tickets = all('SELECT * FROM tickets');
    for (const ticket of tickets) {
      await FirebaseTickets.create(ticket);
    }
    console.log(`✅ ${tickets.length} chamados migrados`);
    
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

// Executar migração se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToFirebase();
}

export default migrateToFirebase;
