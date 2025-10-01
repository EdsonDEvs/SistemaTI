# 🔧 Corrigir Deploy na Vercel

## ❌ Problema Identificado
O erro `npm ENOENT` indica que a Vercel não conseguiu encontrar o `package.json` na raiz. Isso acontece porque a configuração estava tentando executar `npm install` na raiz, mas as dependências estão no frontend.

## ✅ Solução

### Opção 1: Deploy Separado (Recomendado)

#### 1. Deploy do Frontend
1. Acesse [vercel.com](https://vercel.com)
2. **New Project** → **Import Git Repository**
3. **Configure:**
   - **Root Directory:** `frontend/`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

#### 2. Deploy da API
1. **New Project** → **Import Git Repository**
2. **Configure:**
   - **Root Directory:** `api/`
   - **Framework Preset:** `Other`
   - **Build Command:** (deixar vazio)

### Opção 2: Deploy Único (Monorepo)

1. **New Project** → **Import Git Repository**
2. **Configure:**
   - **Root Directory:** `./`
   - **Framework Preset:** `Other`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`

### Opção 3: Usar Vercel CLI (Após Login)

```bash
# Fazer login primeiro
vercel login

# Deploy do frontend
cd frontend
vercel --prod

# Deploy da API
cd ../api
vercel --prod
```

## 🎯 Configurações Atualizadas

### Arquivos Criados/Atualizados:
- ✅ `vercel.json` (raiz) - Configuração simplificada
- ✅ `frontend/vercel.json` - Configuração do frontend
- ✅ `api/vercel.json` - Configuração da API
- ✅ `api/index.js` - Backend como serverless function

### Estrutura Final:
```
https://frontend-projeto.vercel.app/     # Frontend
https://api-projeto.vercel.app/          # API
```

## 🚀 Próximos Passos

1. **Escolha uma das opções acima**
2. **Faça o deploy seguindo as instruções**
3. **Teste as funcionalidades**
4. **Configure domínio personalizado (opcional)**

## 📝 Notas Importantes

- O frontend já está buildado em `frontend/dist/`
- A API está configurada como serverless function
- O banco SQLite funcionará na Vercel
- A nova aba de gastos está incluída
