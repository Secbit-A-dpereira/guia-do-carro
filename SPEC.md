# Spec: Guiadocarro.pt

## Objective

Um site que ajuda consumidores portugueses a escolher o carro certo dentro do orçamento deles, com dados objetivos de fiabilidade apresentados de forma simples (semáforo verde/amarelo/vermelho).

**Utilizador:** Consumidor comum em Portugal, que percebe pouco de carros. Quer resposta rápida, confiável, visual.

**Três cenários:**

1. **Budget → Carros:** Utilizador insere o orçamento, vê carros novos e usados nessa faixa com indicador de fiabilidade
2. **Catálogo:** Navega por marca/modelo, cada ficha tem specs, preço médio, fiabilidade
3. **Comparador:** Seleciona 2-3 carros lado a lado para comparar

## Tech Stack

- **Frontend:** Next.js 16 + Tailwind CSS 4 + TypeScript
- **Backend/Dados:** Supabase (catálogo de carros + reports de fiabilidade dos utilizadores)
- **Deploy:** Cloudflare Pages + Cloudflare Functions (ou Supabase client-side com anon key + RLS)
- **Autenticação:** Nenhuma para o público; eventual painel admin com Supabase Auth
- **Domínio:** guiadocarro.pt (a registar)

## Project Structure

```
guiadocarro/
├── src/
│   ├── app/              → Next.js App Router pages
│   │   ├── page.tsx      → Home / Budget input
│   │   ├── catalogo/     → Catálogo por marca/modelo
│   │   ├── carro/[id]/   → Ficha detalhada do carro
│   │   └── comparar/     → Comparador (2-3 carros)
│   ├── components/       → Componentes reutilizáveis
│   ├── lib/              → Utilitários, helpers, config
│   ├── supabase/         → Cliente Supabase + queries tipadas
│   └── types/            → Tipos TypeScript partilhados
├── data/                 → Scripts de seed/scraping (offline)
├── supabase/             → Esquema SQL, migrations, seed
├── public/               → Assets estáticos
└── SPEC.md               → Este documento
```

## Dados — Supabase Schema (proposta)

**Tabelas principais:**

| Tabela | Descrição |
|--------|-----------|
| `marcas` | Marcas de carros (nome, slug, logo_url) |
| `modelos` | Modelos (marca_id, nome, slug, ano_min, ano_max, segmento, tipo_combustivel) |
| `carros` | Carros individuais / versões (modelo_id, ano, preco_medio, motor, cv, combustivel, fiabilidade_score) |
| `reports_fiabilidade` | Reports de utilizadores (carro_id, ano, km, avarias, custo_reparacao, comentario, created_at) |

**fiabilidade_score** pode ser calculado a partir da média dos reports + dados de curadoria.

## Comandos

```
Dev:      npm run dev
Build:    npm run build
Lint:     npm run lint
Seed DB:  npm run seed (ou script Python offline → Supabase)
Deploy:   wrangler pages deploy out/ --project-name=guiadocarro --branch=main
```

## Code Style

- Componentes React funcionais com TypeScript
- Nomes em inglês para código, conteúdo em PT-PT via i18n ou strings diretas
- Tailwind utility-first, sem CSS modules
- Componentes pequenos (< 200 linhas), ficheiros colocalizados com os estilos

```tsx
// Exemplo de componente de cartão de carro
export function CarroCard({ carro }: { carro: Carro }) {
  return (
    <div className="rounded-xl border p-4">
      <h3 className="text-lg font-semibold">{carro.marca} {carro.modelo}</h3>
      <p className="text-muted-foreground">{carro.ano} · {carro.motor}</p>
      <p className="text-2xl font-bold">{formatPreco(carro.preco_medio)}</p>
      <SemaforoFiabilidade score={carro.fiabilidade_score} />
    </div>
  );
}
```

## Testing Strategy

- **Unit:** Vitest para lógica pura (filtros, cálculos, formatacao)
- **Component:** Testing Library para componentes React
- **E2E:** Playwright mais tarde, quando o UX estiver estável
- **Coverage:** Não obrigatório inicialmente — projeto novo, foco em rapidez

## Boundaries

- **Always:** Commits atómicos, código em PT-PT no conteúdo (inglês no código), verificar build antes de deploy
- **Ask first:** Schema Supabase (migrations), adicionar dependências, alterar estrutura de páginas, nome do domínio
- **Never:** Meter API keys hardcoded, fazer deploy sem verificar build, Commit secrets, esquecer as RLS policies do Supabase

## Success Criteria

1. Utilizador abre o site, mete um budget (ex: 15 000€), vê carros nessa faixa com fiabilidade visível
2. Consegue navegar no catálogo por marca → modelo
3. Consegue comparar 2-3 carros lado a lado
4. Cada carro tem uma ficha com specs + score de fiabilidade
5. Utilizador consegue reportar a experiência de fiabilidade dele
6. Site responsivo (mobile-first), deploy em guiadocarro.pt

## Open Questions (Resolved)

- [x] **Preços:** Scraping manual (StandVirtual, OLX) — mas **apenas quando temos o carro ideal para aquele budget**. Não vamos scrapiar o catálogo todo. Modelos entram manualmente, e o scraping serve para confirmar / atualizar preços e disponibilidade.
- [x] **Fiabilidade inicial:** Score baseado nos dados que formos recolhendo (reports de utilizadores + pesquisa nossa). Começa vazio ou com seed mínimo.
- [x] **Painel admin:** Mais tarde.
- [x] **Ordem:** Começar pelo cenário 1 (Budget → Carros), depois Catálogo, depois Comparador.
