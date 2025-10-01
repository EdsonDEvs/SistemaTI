# Deploy na Vercel - Sistema TI

## Pré-requisitos

1. Conta na Vercel
2. Vercel CLI instalado: `npm i -g vercel`
3. Git configurado

## Passos para Deploy

### 1. Instalar dependências
```bash
npm install
```

### 2. Build do frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### 3. Deploy na Vercel
```bash
vercel login
vercel --prod
```

### 4. Configurar variáveis de ambiente (se necessário)
No dashboard da Vercel, adicione as variáveis de ambiente necessárias.

## Estrutura do Projeto

- `frontend/` - Aplicação React (build estático)
- `api/` - Backend como serverless functions
- `backend/` - Código fonte do backend
- `vercel.json` - Configuração do Vercel

## Funcionalidades

- ✅ Dashboard com métricas
- ✅ Gestão de Serviços
- ✅ Ordens de Serviço (OS)
- ✅ Sistema de Chamados
- ✅ Controle Financeiro
- ✅ **Nova Aba de Gastos**

## URLs

- Frontend: `https://seu-projeto.vercel.app`
- API: `https://seu-projeto.vercel.app/api`

## Banco de Dados

O sistema usa SQLite que será criado automaticamente na Vercel. Os dados são persistidos entre deployments.
