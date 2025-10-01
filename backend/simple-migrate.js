import { initFirebase, hasFirebase } from './src/store/firebase.js';
import { all } from './src/store/db.js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: './.env' });

console.log('🔥 Iniciando migração simples para Firebase...');

if (!hasFirebase()) {
  console.log('❌ Firebase não configurado');
  process.exit(1);
}

console.log('✅ Firebase configurado!');

try {
  const firestore = initFirebase();
  
  // Testar conexão
  console.log('🔍 Testando conexão com Firestore...');
  
  // Criar uma coleção de teste
  const testRef = firestore.collection('test').doc('connection');
  await testRef.set({ 
    message: 'Conexão funcionando!', 
    timestamp: new Date().toISOString() 
  });
  
  console.log('✅ Conexão com Firestore funcionando!');
  
  // Verificar dados existentes
  console.log('📊 Verificando dados existentes...');
  
  const services = all('SELECT * FROM services');
  console.log(`📋 Serviços encontrados: ${services.length}`);
  
  const orders = all('SELECT * FROM os');
  console.log(`📄 Ordens encontradas: ${orders.length}`);
  
  const incomes = all('SELECT * FROM finance_income');
  console.log(`💰 Receitas encontradas: ${incomes.length}`);
  
  const expenses = all('SELECT * FROM finance_expense');
  console.log(`💸 Despesas encontradas: ${expenses.length}`);
  
  const tickets = all('SELECT * FROM tickets');
  console.log(`🎫 Chamados encontrados: ${tickets.length}`);
  
  console.log('🎉 Verificação concluída!');
  console.log('📝 Para migrar os dados, execute o script completo de migração.');
  
} catch (error) {
  console.error('❌ Erro durante o teste:', error);
}
