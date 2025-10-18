# ✨ Códice Sagrado — Os Arquivos da Fé ✨

Uma plataforma moderna e minimalista para a exploração, estudo e conexão com a sabedoria contida em textos sagrados. Este repositório contém o front-end do projeto — pensado para ser acessível, rápido e fácil de estender.

## Índice
- [Visão Geral](#visão-geral)
- [Demonstração](#demonstração)
- [Recursos Principais](#recursos-principais)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Desenvolvimento Local](#instalação-e-desenvolvimento-local)
- [Build e Deploy](#build-e-deploy)
- [Configuração (env)](#configuração-env)
- [Contribuindo](#contribuindo)
- [Boas práticas e Acessibilidade](#boas-práticas-e-acessibilidade)
- [Roadmap](#roadmap)
- [Licença e Contato](#licença-e-contato)

---

## Visão Geral
O objetivo do "Códice Sagrado" é centralizar textos sagrados, comentários e recursos de estudo em uma interface limpa. Queremos tornar o conteúdo fácil de localizar, comparar e anotar, mantendo respeito às tradições e licenças dos textos.

## Demonstração
(Coloque aqui o link para a demo hospedada, por exemplo: https://seu-projeto.lovable.app ou https://your-domain.com)

> Se ainda não tiver uma demo pública, adicione a URL após o deploy.

## Recursos Principais
- Biblioteca digital com organização por fonte, título e tags
- Busca avançada por palavras-chave, frases e conceitos
- Visualização de texto com leitura focada (modo noturno, ajuste de fonte)
- Anotações pessoais e destaques (localmente ou vinculadas a conta)
- Design responsivo para desktop, tablet e celular

## Tecnologias
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

(Adicione badges de build, npm, licence quando disponíveis)

## Pré-requisitos
- Node.js (recomenda-se usar nvm)
- npm ou yarn

## Instalação e Desenvolvimento Local
1. Clone o repositório:
   ```
   git clone https://github.com/shuudesu/arquivosdafe.git
   ```
2. Entre no diretório do projeto:
   ```
   cd arquivosdafe
   ```
3. Instale dependências:
   ```
   npm install
   # ou
   yarn
   ```
4. Inicie o servidor de desenvolvimento:
   ```
   npm run dev
   # ou
   yarn dev
   ```
5. Abra http://localhost:5173 (ou a porta indicada) no seu navegador.

## Build e Deploy
- Para gerar uma versão de produção:
  ```
  npm run build
  # ou
  yarn build
  ```
- Para servir localmente a build:
  ```
  npm run preview
  # ou
  yarn preview
  ```

Deploy sugerido:
- Lovable (conforme indicado): use Share → Publish no painel do projeto.
- Alternativas: Vercel, Netlify, Cloudflare Pages — todas suportam projetos Vite/React com build estática.

## Configuração (ENV)
Se o projeto usar chaves, APIs ou endpoints, descreva aqui (exemplo):
```
VITE_API_URL=https://api.exemplo.com
VITE_MAPS_KEY=xxxxx
```
Informe como criar um arquivo `.env.local` e listar variáveis obrigatórias.

## Contribuindo
Obrigado por considerar contribuir! Algumas orientações:
- Abra uma issue descrevendo a proposta antes de iniciar mudanças significativas.
- Fork → branch com nome `feature/<breve-descrição>` ou `fix/<breve-descrição>`.
- Testes e lint passando antes do PR.
- Descreva no PR o que mudou e por quê.

Sugestões para arquivos adicionais:
- CONTRIBUTING.md (detalhando processo de PRs)
- CODE_OF_CONDUCT.md
- .github/ISSUE_TEMPLATE.md e .github/PULL_REQUEST_TEMPLATE.md

## Boas práticas e Acessibilidade
- Use semântica HTML e roles ARIA onde necessário.
- Assegure contraste suficiente para leitura.
- Navegação por teclado e leitor de tela testados nas views principais.

## Roadmap (exemplos)
- [ ] Sistema de anotações e contas (autenticação)
- [ ] Importação/exportação de coleções
- [ ] Modos de leitura personalizáveis (colunas, tipografia)
- [ ] Traduções / internacionalização (i18n)

## Troubleshooting
- Dependências falhando na instalação: verifique a versão do Node e limpe `node_modules` + `package-lock.json`.
- Erros de CORS ao consumir APIs: configurar proxy ou ajustar servidor.

## Licença
(Adicione a licença do projeto, ex.: MIT)
```
MIT © Seu Nome
```

## Contato
- Autor: shuudesu
- GitHub: https://github.com/shuudesu
- Email: (opcional) seu-email@exemplo.com

---

Se quiser, posso:
- Gerar um CONTRIBUTING.md e CODE_OF_CONDUCT.md inicial.
- Criar templates para issues e PRs.
- Adicionar badges (CI, npm, license) e instruções de CI (GitHub Actions).
