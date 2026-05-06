# CardosoHub — Deploy no Vercel

## Estrutura do projeto
```
cardosohub/
├── api/
│   ├── chat.js       ← proxy para GPT-4o Mini
│   ├── vision.js     ← proxy para análise de imagens
│   └── whisper.js    ← proxy para transcrição de áudio
├── public/
│   └── index.html    ← a app
├── package.json
├── vercel.json
└── README.md
```

## Como fazer o deploy

### 1. Criar conta Vercel
- Vai a vercel.com → Sign Up → continua com GitHub

### 2. Criar repositório GitHub
- Cria um novo repositório chamado `cardosohub`
- Faz upload de TODOS os ficheiros (mantendo a estrutura de pastas)

### 3. Importar no Vercel
- No dashboard Vercel → "Add New Project"
- Escolhe o repositório `cardosohub`
- Clica Deploy (sem alterar nada)

### 4. Adicionar a API Key (IMPORTANTE)
- No projeto Vercel → Settings → Environment Variables
- Adiciona:
  - Name: `OPENAI_API_KEY`
  - Value: `sk-proj-...` (a tua chave da OpenAI)
  - Clica Save

### 5. Fazer Redeploy
- Vai a Deployments → clica nos 3 pontinhos do último deploy → Redeploy
- Aguarda 1 minuto

### 6. Aceder à app
- O Vercel dá-te um link tipo: `cardosohub.vercel.app`
- Abre no celular e adiciona ao ecrã inicial!

## Porquê o Vercel e não o GitHub Pages?
O GitHub Pages só serve ficheiros estáticos. 
A OpenAI bloqueia chamadas diretas do browser (CORS).
O Vercel corre as funções `/api` no servidor, onde a API Key fica segura e sem CORS.
