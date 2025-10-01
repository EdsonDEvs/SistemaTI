# Deploy Manual na Vercel - Sistema TI

## 🚀 Instruções Passo a Passo

### 1. Preparação do Projeto
O projeto já está configurado com todos os arquivos necessários:
- ✅ `vercel.json` - Configuração do Vercel
- ✅ `package.json` - Scripts de build
- ✅ `api/index.js` - Backend como serverless function
- ✅ Frontend buildado em `frontend/dist/`

### 2. Deploy via Dashboard da Vercel

#### Opção A: Upload via Git
1. **Faça commit e push do projeto:**
   ```bash
   git add .
   git commit -m "Deploy: Sistema TI com aba de gastos"
   git push origin main
   ```

2. **Acesse [vercel.com](https://vercel.com)**
3. **Clique em "New Project"**
4. **Conecte seu repositório GitHub**
5. **Configure o projeto:**
   - Framework Preset: `Other`
   - Root Directory: `./` (raiz)
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`

#### Opção B: Upload Direto
1. **Acesse [vercel.com](https://vercel.com)**
2. **Clique em "New Project"**
3. **Selecione "Upload"**
4. **Arraste a pasta do projeto inteira**
5. **Configure:**
   - Framework: `Other`
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`

### 3. Configurações Importantes

#### Build Settings:
- **Framework Preset:** Vite
- **Root Directory:** `frontend/`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### Para a API (Backend):
- **Root Directory:** `api/`
- **Framework:** Node.js
- **Build Command:** (deixar vazio)

#### Environment Variables:
- `NODE_ENV` = `production`

### 4. Estrutura do Deploy

```
https://seu-projeto.vercel.app/          # Frontend React
https://seu-projeto.vercel.app/api/      # Backend API
```

### 5. Funcionalidades Disponíveis

- ✅ Dashboard com métricas financeiras
- ✅ Gestão de Serviços
- ✅ Ordens de Serviço (OS)
- ✅ Sistema de Chamados
- ✅ Controle Financeiro (Receitas/Despesas)
- ✅ **Nova Aba de Gastos** com filtros e CRUD completo

### 6. Banco de Dados

O SQLite será criado automaticamente na Vercel e persistirá entre deployments.

### 7. Verificação Pós-Deploy

Após o deploy, teste:
1. Acesse a URL fornecida pela Vercel
2. Navegue pela aplicação
3. Teste a nova aba "Gastos"
4. Verifique se a API está funcionando

## 🎯 Próximos Passos

1. Faça o deploy seguindo as instruções acima
2. Teste todas as funcionalidades
3. Configure domínio personalizado (opcional)
4. Configure variáveis de ambiente adicionais se necessário

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de build na Vercel
2. Confirme se todos os arquivos estão no repositório
3. Verifique se as dependências estão corretas
