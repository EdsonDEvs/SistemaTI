# Sistema de Gestão para Assistência Técnica

Sistema completo para gestão de assistência técnica de informática (computadores, notebooks e periféricos).

## 🚀 Funcionalidades

### ✅ Módulos Implementados
- **Serviços**: CRUD com cálculo de preços (produtos + mão de obra)
- **Ordens de Serviço (OS)**: Gestão completa com geração de PDF
- **Controle Financeiro**: Receitas, despesas e dashboard
- **Chamados/Tickets**: Sistema de controle de atendimentos
- **Termo de Prestação**: Geração automática de PDF com dados da OS

### 🔧 Tecnologias
- **Backend**: Node.js + Express + SQLite
- **Frontend**: React + Vite
- **Banco**: SQLite (local) + Firebase Firestore (opcional)
- **PDF**: jsPDF para geração de documentos

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/EdsonDEvs/SistemaTI.git
cd SistemaTI
```

### 2. Instale as dependências
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Execute o sistema
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 4. Acesse o sistema
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## 🎯 Como Usar

### 1. Serviços
- Cadastre serviços padrão (formatação, troca de tela, etc.)
- Configure preços de produtos e mão de obra
- Edite serviços diretamente na tabela

### 2. Ordens de Serviço
- Crie OS com cliente, contato, aparelho
- Adicione itens (serviços/peças) com quantidades
- Gere PDF do Termo de Prestação automaticamente

### 3. Financeiro
- Acompanhe receitas e despesas
- Visualize dashboard com métricas mensais
- Exporte relatórios

### 4. Chamados
- Controle status e prioridade dos atendimentos
- Acompanhe progresso dos serviços

## 🔐 Configuração Firebase (Opcional)

Para usar Firebase Firestore:

1. Crie projeto no Firebase Console
2. Baixe as credenciais do service account
3. Renomeie para `sistemati-firebase-adminsdk-xxx.json`
4. Coloque na pasta `backend/`
5. Configure no arquivo `.env`:
```
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_CREDENTIALS=./sistemati-firebase-adminsdk-xxx.json
```

## 📁 Estrutura do Projeto

```
SistemaTI/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── routes/         # Rotas da API
│   │   ├── store/          # Banco de dados
│   │   └── server.js       # Servidor principal
│   └── package.json
├── frontend/               # React App
│   ├── src/
│   │   ├── pages/          # Páginas do sistema
│   │   ├── ui/             # Componentes
│   │   └── lib/            # Utilitários
│   ├── Termo.txt           # Template do Termo PDF
│   └── package.json
└── README.md
```

## 🎨 Interface

- Design moderno e responsivo
- Navegação intuitiva entre módulos
- Formulários com validação
- Tabelas com edição inline
- Geração automática de PDFs

## 📊 Dashboard

- Faturamento mensal
- Lucro líquido
- Serviços concluídos
- Taxa de aprovação de orçamentos
- Gráficos de receitas vs despesas

## 🔄 Integração Automática

- Criação de serviço → Gera receita financeira
- Criação de serviço → Cria chamado relacionado
- Criação de serviço → Cria OS básica
- OS → Gera Termo PDF com dados automáticos

## 📝 Licença

Este projeto é de uso pessoal/profissional.

## 👨‍💻 Desenvolvido por

Edson da Silva Leandro
- GitHub: [@EdsonDEvs](https://github.com/EdsonDEvs)
- Email: euedsonleandro@gmail.com
