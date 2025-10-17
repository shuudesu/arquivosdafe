# 📚 Guia Completo - Biblioteca Digital Lumen Books

## 📋 Índice

1. [Como Criar o Primeiro Usuário Admin](#1-como-criar-o-primeiro-usuário-admin)
2. [Como Acessar o Painel Admin](#2-como-acessar-o-painel-admin)
3. [Como Criar Novos Usuários](#3-como-criar-novos-usuários)
4. [Como Fazer Upload de Livros](#4-como-fazer-upload-de-livros)
5. [Como Fazer Deploy](#5-como-fazer-deploy)
6. [Deploy em Servidor Próprio](#6-deploy-em-servidor-próprio)

---

## 1. Como Criar o Primeiro Usuário Admin

### Passo 1: Acessar o Backend do Lovable Cloud

1. Clique no botão **"View Backend"** (ou "Abrir Backend") no painel do Lovable
2. Você será direcionado para o painel de gerenciamento do backend

### Passo 2: Criar o Usuário via SQL

1. No painel do backend, vá em **"SQL Editor"** ou **"Table Editor"**
2. Execute os seguintes comandos SQL para criar seu primeiro usuário admin:

```sql
-- Passo 1: Criar o usuário no sistema de autenticação
-- Substitua 'seu-email@exemplo.com' e 'sua-senha-segura' pelos seus dados
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'seu-email@exemplo.com',
  crypt('sua-senha-segura', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

### Passo 3: Adicionar a Role de Admin

```sql
-- Passo 2: Obter o ID do usuário que acabamos de criar
-- (execute este comando e copie o ID retornado)
SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com';

-- Passo 3: Adicionar role de admin ao usuário
-- Substitua 'ID-DO-USUARIO' pelo ID que você copiou acima
INSERT INTO public.user_roles (user_id, role)
VALUES ('ID-DO-USUARIO', 'admin');
```

### ✅ Alternativa Mais Simples

Se você tiver acesso ao **Table Editor** do backend:

1. Vá para a tabela **`auth.users`**
2. Clique em **"Insert row"** ou **"Add user"**
3. Preencha:
   - **Email**: seu-email@exemplo.com
   - **Password**: (sua senha será automaticamente criptografada)
   - Marque: **Email confirmed**
4. Copie o **ID** do usuário criado
5. Vá para a tabela **`user_roles`**
6. Clique em **"Insert row"**
7. Preencha:
   - **user_id**: (cole o ID que você copiou)
   - **role**: admin

---

## 2. Como Acessar o Painel Admin

### Opção 1: Via URL Direta
Acesse: `https://seu-dominio.lovable.app/admin`

### Opção 2: Via Link na Página Inicial
1. Faça login com seu usuário admin
2. Na página inicial, clique no botão **"Painel Admin"**
3. Você será redirecionado para `/admin`

### ⚠️ Importante
- Somente usuários com role de **admin** podem acessar o painel
- Se você não for admin, será redirecionado para a página inicial

---

## 3. Como Criar Novos Usuários

### Via Painel Admin

1. Acesse o **Painel Admin** (`/admin`)
2. Vá para a aba **"Links de Convite"**
3. Clique em **"Gerar Novo Link"**
4. Um link criptografado será gerado com validade de 7 dias
5. Copie o link e envie para o novo usuário
6. O novo usuário deve:
   - Clicar no link
   - Criar uma senha
   - Fazer login

### Características dos Links de Convite

- ✅ Válidos por **7 dias**
- ✅ Uso único (após cadastro, o link expira)
- ✅ Criptografados e seguros
- ✅ Podem ser revogados a qualquer momento

---

## 4. Como Fazer Upload de Livros

### Passo a Passo

1. Acesse o **Painel Admin** (`/admin`)
2. Vá para a aba **"Upload de Livros"**
3. Preencha os campos:
   - **Título** (obrigatório)
   - **Autor** (opcional)
   - **Descrição** (opcional)
   - **Arquivo PDF** (obrigatório)
4. Clique em **"Fazer Upload"**
5. Aguarde o upload ser concluído

### 💡 Dicas

- PDFs são armazenados com segurança no storage do Lovable Cloud
- Apenas admins podem fazer upload de livros
- Todos os usuários autenticados podem visualizar e baixar os livros

---

## 5. Como Fazer Deploy

### Deploy via Lovable (Recomendado)

1. No editor do Lovable, clique no botão **"Publish"** no canto superior direito
2. Seu site será publicado automaticamente em:
   - `https://seu-projeto.lovable.app`
3. O deploy inclui:
   - ✅ Frontend (React + Vite)
   - ✅ Backend (Lovable Cloud/Supabase)
   - ✅ Banco de dados
   - ✅ Autenticação
   - ✅ Storage de arquivos
   - ✅ SSL/HTTPS automático

### Conectar Domínio Personalizado

1. No Lovable, vá em **Project > Settings > Domains**
2. Clique em **"Add custom domain"**
3. Digite seu domínio (ex: `biblioteca.com.br`)
4. Siga as instruções para configurar o DNS:
   - Adicione um registro **CNAME** apontando para Lovable
   - Ou adicione registros **A** conforme instruído
5. Aguarde a propagação do DNS (até 48h)

#### Exemplo de Configuração DNS

```
Tipo: CNAME
Nome: www
Valor: cname.lovable.app

Tipo: A
Nome: @
Valor: [IP fornecido pelo Lovable]
```

---

## 6. Deploy em Servidor Próprio

### Requisitos

- Node.js 18+
- Servidor com Nginx ou Apache
- Domínio próprio
- Certificado SSL (recomendado: Let's Encrypt)

### Passo 1: Preparar o Projeto

```bash
# Clone seu projeto do GitHub
git clone https://github.com/seu-usuario/seu-projeto.git
cd seu-projeto

# Instale as dependências
npm install

# Build do projeto
npm run build
```

### Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
VITE_SUPABASE_PROJECT_ID=seu-projeto-id
```

> ⚠️ **Importante**: Você precisará de uma conta Supabase para obter essas credenciais, pois o Lovable Cloud não fornece acesso externo direto.

### Passo 3: Deploy com Nginx

#### Instalar Nginx

```bash
sudo apt update
sudo apt install nginx
```

#### Configurar Nginx

Crie um arquivo de configuração:

```bash
sudo nano /etc/nginx/sites-available/biblioteca
```

Adicione a configuração:

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br www.seu-dominio.com.br;
    
    root /var/www/biblioteca/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Compressão
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache de arquivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Ative o site:

```bash
sudo ln -s /etc/nginx/sites-available/biblioteca /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Passo 4: Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com.br -d www.seu-dominio.com.br

# Renovação automática (já configurada)
sudo certbot renew --dry-run
```

### Passo 5: Deploy do Build

```bash
# Copiar arquivos do build
sudo mkdir -p /var/www/biblioteca
sudo cp -r dist/* /var/www/biblioteca/

# Definir permissões
sudo chown -R www-data:www-data /var/www/biblioteca
sudo chmod -R 755 /var/www/biblioteca
```

### 🔄 Automatizar Deploy com GitHub Actions

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Server

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
    
    - name: Deploy to server
      uses: easingthemes/ssh-deploy@main
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        ARGS: "-rltgoDzvO --delete"
        SOURCE: "dist/"
        REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
        REMOTE_USER: ${{ secrets.REMOTE_USER }}
        TARGET: "/var/www/biblioteca/"
```

---

## 📊 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React)                    │
│  - Vite                                             │
│  - TypeScript                                       │
│  - Tailwind CSS                                     │
│  - React Router                                     │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│           Lovable Cloud / Supabase                   │
│  ┌──────────────────────────────────────────────┐  │
│  │  Authentication (auth.users)                  │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  Database                                     │  │
│  │  - profiles                                   │  │
│  │  - user_roles                                 │  │
│  │  - books                                      │  │
│  │  - invite_links                               │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  Storage                                      │  │
│  │  - pdfs/ (privado)                            │  │
│  │  - covers/ (público)                          │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Segurança

### Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado:

- ✅ **books**: Apenas admins podem inserir/atualizar/deletar
- ✅ **user_roles**: Apenas admins podem gerenciar
- ✅ **invite_links**: Apenas admins podem criar/visualizar
- ✅ **profiles**: Usuários só veem o próprio perfil

### Boas Práticas

1. ✅ Senhas criptografadas automaticamente
2. ✅ Tokens de convite com expiração
3. ✅ Storage com políticas de acesso
4. ✅ Autenticação obrigatória para acesso aos livros

---

## 🆘 Problemas Comuns

### Não consigo acessar o painel admin

**Solução**: Verifique se você tem a role de admin na tabela `user_roles`

### Links de convite não funcionam

**Solução**: Verifique se o link não expirou (validade de 7 dias)

### Erro ao fazer upload de PDF

**Solução**: 
- Verifique se o arquivo é realmente um PDF
- Verifique o tamanho do arquivo (limite padrão: 50MB)

### Não consigo fazer login

**Solução**: 
- Verifique se o email está confirmado
- Reset de senha via "Esqueci minha senha"

---

## 📞 Suporte

Para mais informações sobre o Lovable:
- [Documentação Oficial](https://docs.lovable.dev/)
- [Discord Community](https://discord.com/channels/lovable)

---

**Última atualização**: Outubro 2025
