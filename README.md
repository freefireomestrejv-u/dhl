# Super José Treinamento

Quiz mobile para treinar a equipe do supermercado a decorar os códigos
(PLU) das frutas e verduras. A pessoa vê a foto e o nome do produto,
digita o código e recebe na hora um "Parabéns, você acertou!" ou um
"Ops... você errou!" com o código certo mostrado na tela.

- **Jogar**: quiz com pontuação de acertos/erros e correção na hora.
- **Admin**: painel para cadastrar produtos (foto, nome e código).

## Stack

- [Vite](https://vite.dev/) + React
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — banco de dados (tabela de itens) e
  armazenamento das fotos

Por que Supabase? O painel do admin precisa **salvar** os produtos em
algum lugar que sobreviva a um refresh da página e que seja o mesmo para
todos os aparelhos (o caixa cadastra no celular dele, qualquer
funcionário joga em qualquer outro celular). Um simples `localStorage`
não resolve isso — por isso o projeto já vem pronto com Supabase
(banco de dados Postgres + armazenamento de imagens), que tem plano
gratuito confortável para esse uso.

## 1. Configurar o Supabase

1. Crie uma conta e um projeto em [supabase.com](https://supabase.com/)
   (o plano gratuito é suficiente).
2. Abra **SQL Editor** → **New query**, cole o conteúdo do arquivo
   [`supabase/schema.sql`](./supabase/schema.sql) e rode. Isso cria:
   - a tabela `items` (nome, código, url da imagem);
   - o bucket de armazenamento `item-images`, público;
   - as políticas de acesso (RLS) necessárias.
3. Vá em **Project Settings → API** e copie:
   - **Project URL**
   - **anon public key**

## 2. Configurar o projeto

```bash
npm install
cp .env.example .env
```

Abra o `.env` e preencha:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ADMIN_PASSWORD=escolha-uma-senha   # opcional, veja aviso abaixo
```

Rodar localmente:

```bash
npm run dev
```

Gerar build de produção (usado no deploy):

```bash
npm run build
```

## 3. Publicar no GitHub + Vercel

```bash
git init
git add .
git commit -m "Super José Treinamento"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main
```

Depois, em [vercel.com](https://vercel.com/): **New Project** → importe
o repositório → em **Environment Variables** adicione as mesmas
variáveis do seu `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
`VITE_ADMIN_PASSWORD`) → Deploy. (Funciona do mesmo jeito na Netlify ou
qualquer host de sites estáticos.)

> O `.env` nunca é commitado (já está no `.gitignore`) — as chaves de
> produção ficam só nas variáveis de ambiente da Vercel.

## Sobre a senha do admin

`VITE_ADMIN_PASSWORD` é só uma trava simples: pede uma senha antes de
mostrar o painel, para um cliente curioso não cair no admin sem querer.
Como o site é estático, essa senha acaba embutida no código que roda no
navegador — alguém com bastante conhecimento técnico consegue lê-la. Se
quiser proteção de verdade (login individual por funcionário, etc.), o
próximo passo é trocar isso por
[Supabase Auth](https://supabase.com/docs/guides/auth). Para o uso
interno de uma equipe de loja, a senha simples costuma ser suficiente.

## Personalizar

- **Nome do site**: troque "Super José" em `src/pages/Home.jsx` e a tag
  `<title>` em `index.html`.
- **Cores**: tudo em `src/index.css`, dentro do bloco `@theme`
  (`--color-royal` é o azul de destaque, `--color-ink` o texto).
- **Textos do quiz**: em `src/pages/Quiz.jsx` (mensagens de acerto/erro,
  estados vazios).

## Estrutura

```
src/
  lib/supabaseClient.js   # cliente Supabase
  components/             # Button e ícones reutilizáveis
  pages/
    Home.jsx              # tela inicial (Jogar / Admin)
    Admin.jsx             # senha + cadastro + lista de itens
    Quiz.jsx              # o jogo em si
supabase/schema.sql       # script para rodar no Supabase
```
