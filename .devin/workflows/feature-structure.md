---
description: Estrutura de pastas e regras de organização do projeto (feature-based architecture)
---

# Estrutura Feature-Based

## Estrutura Base

```
src/
  app/
    _layout.tsx
    index.tsx
    auth/
    tabs/
    components/
  features/
    <feature>/
      graphql/
        <name>.mutation.graphql
        <name>.query.graphql
      components/
      hooks/
      screens/
      schemas/
      services/
      testing/
        <feature>.builders.ts
        <feature>.handlers.ts
      types.ts
      index.ts
  shared/
    analytics/
    config/
    graphql/
      cache.ts
      client.ts
      errors.ts
      generated/
      links/
    observability/
    security/
    storage/
    theme/
      brands/
      tokens/
      ThemeProvider.tsx
    testing/
    ui/
      Button/
      TextField/
      Card/
    utils/
```

## Regra principal

> Código nasce dentro da feature. Só vai para `shared/` quando houver **reutilização real**, **contrato estável** e **ausência de dono único**.

## O que fica na feature

- `src/features/<feature>/graphql/` — queries e mutations GraphQL específicas da feature.
- `src/features/<feature>/components/` — componentes visuais usados apenas nessa feature.
- `src/features/<feature>/hooks/` — hooks específicos da feature.
- `src/features/<feature>/screens/` — telas/páginas da feature.
- `src/features/<feature>/schemas/` — schemas de validação (Zod, Yup, etc.) da feature.
- `src/features/<feature>/services/` — lógica de serviço/domínio da feature.
- `src/features/<feature>/testing/` — builders, handlers e mocks específicos da feature.
- `src/features/<feature>/types.ts` — tipos e interfaces da feature.
- `src/features/<feature>/index.ts` — barrel export público da feature.

## O que vai para shared

- `shared/ui/` — componentes base do design system (Button, Input, Card, etc.).
- `shared/utils/` — utilitários usados por **múltiplas** features (ex: `formatCurrency`, `cn`).
- `shared/graphql/` — configuração do Apollo Client, cache, error handling e links compartilhados.
- `shared/testing/` — helpers de teste genéricos usados pela suite inteira.
- `shared/theme/` — tokens de design, brands e ThemeProvider.
- `shared/config/` — configurações globais da aplicação.
- `shared/security/` — autenticação, tokens, interceptors.
- `shared/storage/` — abstração de storage (AsyncStorage, localStorage, etc.).
- `shared/analytics/` — tracking e analytics.
- `shared/observability/` — logging, error reporting.

## Exemplos de decisão

### Fica na feature

| Artefato | Motivo |
|----------|--------|
| `ProfileHeader` usado apenas em `profile` | Dono único |
| `HomeOffers.query.graphql` usado apenas na home | GraphQL específico |
| `payment.handlers.ts` usado apenas em `payment` | Mock/builder específico |

### Pode ir para shared

| Artefato | Motivo |
|----------|--------|
| `Button` base do design system | Reutilizado em todas as features |
| `formatCurrency` usado em várias features | Utilitário genérico |
| `authLink` do Apollo usado por todo o app | Infra compartilhada |
| Test render helper usado pela suite inteira | Testing genérico |

## Checklist antes de mover para shared

1. O artefato é usado por **2+ features** diferentes?
2. O contrato (props, API) é **estável** e não muda com frequência?
3. Não existe um **dono único** — nenhuma feature sozinha dita a evolução?
4. Mover para shared **reduz duplicação** sem criar acoplamento?

Se qualquer resposta for **não**, mantenha na feature.

## Regras adicionais

- Nunca importe de uma feature para outra diretamente. Use `shared/` como ponte se necessário.
- Cada feature expõe apenas o necessário pelo `index.ts`.
- `shared/graphql/`, `shared/models/` e `shared/services/` **não devem virar depósito global** — prefira manter perto da feature.
- Crie `testing/` dentro da feature quando mocks e builders forem específicos dela.
- GraphQL específico **sempre fica perto da feature** em `features/<feature>/graphql/`.
