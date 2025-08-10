# Agent Guidelines for Silroad

## Commands

- **Build**: `pnpm build`
- **Lint/Format**: `pnpm lint` (prettier + eslint)
- **Tests**: `pnpm test` (unit + e2e), `pnpm test:unit`, `pnpm test:e2e`
- **Single test**: `pnpm test:unit path/to/test.ts` or `npx playwright test path/to/test.ts`
- **Dev server**: `pnpm dev`
- **Type check**: `pnpm check`
- **DB operations**: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:studio`

## Code Style

- **Formatting**: Tabs, single quotes, 100 char width, no trailing commas
- **TypeScript**: Strict mode enabled, explicit types preferred
- **Imports**: Node.js imports use `node:` prefix, relative imports for local files
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Database**: Drizzle ORM with schema-first approach, UUID primary keys
- **Error handling**: Fail fast with descriptive messages, include context
- **Components**: Svelte 5 with runes, Skeleton UI + Tailwind CSS

## Patterns

- Repository pattern for data access (`src/lib/repos/`)
- Utility functions in `src/lib/utils/`
- Route-based organization with `+page.server.ts` for server logic
- Session-based auth with secure password hashing (scrypt + salt)

Follow the comprehensive guidelines in `.github/instructions/` for development philosophy and process.
