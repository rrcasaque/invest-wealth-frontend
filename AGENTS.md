# InvestWealth — Guia do Projeto

## Stack

- React 19 + Vite 8 + TypeScript 6 + SWC
- Tailwind CSS v4 + shadcn/ui (Radix primitives)
- React Router DOM 7, Recharts 3, React Hook Form 7, Zod 4
- Vitest 4 + Testing Library para testes
- pnpm como gerenciador de pacotes
- Oxlint para linting

## Comandos

| Comando              | Descrição                                  |
| -------------------- | ------------------------------------------ |
| `pnpm dev`           | Inicia o dev server (Vite)                 |
| `pnpm build`         | Type-check + build de produção             |
| `pnpm lint`          | Roda o Oxlint                              |
| `pnpm test`          | Roda os testes (Vitest) uma vez            |
| `pnpm test:watch`    | Roda os testes em modo watch               |
| `pnpm test:coverage` | Roda os testes com cobertura               |
| `pnpm preview`       | Serva o build de produção localmente       |

## Arquitetura

O projeto segue uma arquitetura feature-based:

```
src/
  app/            # Entry point, layouts, rotas
    components/   # AppShell, AuthLayout, Sidebar, Topbar
    routes.tsx    # Configuração de rotas (lazy loading)
    index.tsx     # App component (providers + router)
  features/       # Features isoladas
    auth/         # Login, Cadastro, Recuperação de senha
    dashboard/    # Painel (dark/light via ThemeProvider)
    performance/  # Desempenho comparativo
    simulations/  # Motor de simulação
    portfolio-balancing/ # Balanceamento de portfólio
    investor-wallet/    # Carteira de investidor (renda fixa, cripto, aluguel)
  shared/         # Infraestrutura compartilhada
    ui/           # Componentes shadcn/ui
    theme/        # ThemeProvider (dark/light com persistência)
    config/       # Configuração de navegação e ambiente
    layout/       # PageContainer, ResponsiveGrid
    charts/       # ChartContainer, ChartTooltip
    storage/      # theme-storage
    utils/        # cn, formatCurrency, formatPercentage, etc.
    testing/      # Setup do Vitest + renderWithProviders
```

### Regras

- **Nunca** importar uma feature diretamente dentro de outra feature.
- Features expõem sua API pública via `index.ts`.
- Código compartilhado fica em `shared/` apenas quando há reuso real.
- Dark/light theme é controlado pelo `ThemeProvider` — não há feature `dashboard-light`.
- Mock data fica dentro da feature proprietária (em `services/`).
- Validação fica em `schemas/`, lógica de negócio em `services/`/`hooks/`.

## Rotas

| Rota                | Tela                        |
| ------------------- | --------------------------- |
| `/entrar`           | Login                       |
| `/cadastro`         | Cadastro                    |
| `/recuperar-senha`  | Recuperação de senha        |
| `/painel`           | Dashboard (dark/light)      |
| `/desempenho`       | Performance                 |
| `/simulacoes`       | Simulações                  |
| `/balanceamento`    | Balanceamento de portfólio  |
| `/pagamentos`       | Assistente de Pagamentos    |
| `/carteira`         | Carteira de Investidor      |

## Alias

`@` mapeia para `src/` (configurado em `tsconfig.app.json` e `vite.config.ts`).
