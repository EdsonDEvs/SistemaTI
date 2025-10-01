# 🔥 Configuração do Firebase

## 📋 Pré-requisitos

1. **Conta Google** com acesso ao Firebase
2. **Projeto Firebase** criado
3. **Chave de serviço** baixada

## 🚀 Passos para Configuração

### 1. Criar Projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **"Adicionar projeto"**
3. Nome do projeto: `sistema-ti` (ou outro nome)
4. Ative **Google Analytics** (opcional)
5. Clique em **"Criar projeto"**

### 2. Configurar Firestore Database

1. No painel do projeto, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Começar no modo de teste"**
4. Escolha uma localização (ex: `us-central1`)
5. Clique em **"Concluído"**

### 3. Gerar Chave de Serviço

1. Clique no ícone de **engrenagem** (Configurações do projeto)
2. Vá para a aba **"Contas de serviço"**
3. Clique em **"Gerar nova chave privada"**
4. Baixe o arquivo JSON (ex: `firebase-service-account.json`)

### 4. Configurar Variáveis de Ambiente

#### Para Desenvolvimento Local:

Crie um arquivo `.env` na raiz do projeto:

```env
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_CREDENTIALS=./firebase-service-account.json
```

#### Para Deploy na Vercel:

1. Acesse o dashboard da Vercel
2. Vá para **"Settings"** → **"Environment Variables"**
3. Adicione as variáveis:

```
FIREBASE_PROJECT_ID = seu-projeto-id
FIREBASE_CREDENTIALS = {"type":"service_account","project_id":"seu-projeto-id",...}
```

**⚠️ IMPORTANTE:** Para a Vercel, você precisa colar o conteúdo completo do arquivo JSON da chave de serviço na variável `FIREBASE_CREDENTIALS`.

### 5. Estrutura das Coleções

O sistema criará automaticamente estas coleções no Firestore:

- `services` - Serviços oferecidos
- `os` - Ordens de Serviço
- `os_items` - Itens das OS
- `finance_income` - Receitas
- `finance_expense` - Despesas/Gastos
- `tickets` - Chamados
- `settings` - Configurações do sistema

## 🔄 Sincronização

### Como Funciona:

1. **Firebase disponível** → Usa Firestore
2. **Firebase indisponível** → Fallback para SQLite
3. **Dados sincronizados** entre local e deploy

### Vantagens:

- ✅ **Dados compartilhados** entre local e deploy
- ✅ **Backup automático** na nuvem
- ✅ **Acesso de qualquer lugar**
- ✅ **Fallback seguro** para SQLite

## 🧪 Testando a Configuração

### 1. Teste Local:

```bash
# Instalar dependências
cd backend
npm install

# Configurar .env
echo "FIREBASE_PROJECT_ID=seu-projeto-id" > .env
echo "FIREBASE_CREDENTIALS=./firebase-service-account.json" >> .env

# Executar servidor
npm start
```

### 2. Teste no Deploy:

1. Configure as variáveis de ambiente na Vercel
2. Faça deploy do projeto
3. Teste as funcionalidades
4. Verifique se os dados aparecem no Firestore

## 🔧 Solução de Problemas

### Erro: "Firebase not initialized"

- Verifique se `FIREBASE_PROJECT_ID` está correto
- Verifique se `FIREBASE_CREDENTIALS` está configurado
- Verifique se a chave de serviço é válida

### Erro: "Permission denied"

- Verifique as regras do Firestore
- Certifique-se de que a chave de serviço tem permissões

### Dados não aparecem

- Verifique se as coleções foram criadas no Firestore
- Verifique os logs do servidor para erros
- Teste com dados simples primeiro

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do servidor
2. Confirme as variáveis de ambiente
3. Teste a conexão com o Firebase
4. Verifique as permissões da chave de serviço
