# Tasks — Guiadocarro.pt

## Wave 1: Setup

- [ ] **1.1 Init Next.js + Tailwind + Supabase**
  - `npx create-next-app@latest guiadocarro --typescript --tailwind --eslint`
  - Instalar `@supabase/supabase-js`
  - Criar cliente Supabase (`src/lib/supabase.ts`)
  - Configurar env vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
  - Verificar: `npm run dev` abre, Supabase client faz query

- [ ] **1.2 Supabase Schema + Seed**
  - Executar migrations: marcas, modelos, carros, reports_fiabilidade
  - Inserir seed: 3-5 carros reais com specs
  - RLS: leitura pública anon, escrita anónima limitada (report)
  - Verificar: query anon SELECT devolve carros

- [ ] **1.3 Layout base (Header + Footer)**
  - Header com navegação (Home, Catálogo)
  - Footer simples
  - Verificar: navegação funciona, responsive

## Wave 2: Home — Budget → Carros

- [ ] **2.1 BudgetInput**
  - Slider + input numérico (0€ - 100k€)
  - Botão "Pesquisar"
  - Estado no URL (search param) para shareability
  - Verificar: meter 15000 muda o URL

- [ ] **2.2 SemaforoFiabilidade**
  - Componente visual: bola verde/amarela/vermelha + legenda
  - Score 0-100 → cor correspondente
  - Score = 0 mostra "sem dados"
  - Verificar: renderiza todas as cores com props diferentes

- [ ] **2.3 CarroCard**
  - Mostra: nome, ano, preço médio, motor, fiabilidade (Semaforo)
  - Link para ficha do carro
  - Verificar: renderiza com dados mock

- [ ] **2.4 Home page — query + resultados**
  - Query Supabase: carros WHERE preco_medio <= budget
  - Grid de CarroCards
  - Estado vazio (sem resultados), loading, erro
  - Verificar: budget 5000€ mostra carros até 5k€

## Wave 3: Ficha do Carro

- [ ] **3.1 Página /carro/[id]**
  - Query Supabase por ID
  - Mostra: specs completas, preço, fiabilidade, reports
  - Botão "Reportar fiabilidade" → link para report
  - Verificar: navegar de CarroCard → ficha funciona

## Wave 4: Catálogo

- [ ] **4.1 Página de marcas**
  - Lista de marcas (fetch de Supabase)
  - Grid com logos/nomes
  - Verificar: clicar marca → vai para modelos

- [ ] **4.2 Página de modelos por marca**
  - Lista de modelos com filtros (combustível, ano, preço)
  - CarroCards
  - Verificar: filtrar diesel esconde carros a gasolina

## Wave 5: Comparador

- [ ] **5.1 Página /comparar?ids=1,2,3**
  - Selecionar carros (checkboxes + botão "Comparar")
  - Tabela lado a lado: specs, preço, fiabilidade
  - Verificar: 3 carros em colunas, scroll horizontal no mobile

## Wave 6: Reports de Fiabilidade

- [ ] **6.1 ReportForm + Supabase insert**
  - Formulário: carro, ano, km, avarias (checkboxes), custo, comentário
  - Insert anónimo no Supabase (RLS permissivo para insert)
  - Feedback visual após submissão
  - Verificar: report aparece na tabela Supabase
