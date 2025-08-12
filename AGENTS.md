# Agent Guidelines for Silroad

An event organizer platform that helps organizations create, manage, and promote events while connecting people through shared experiences.

## Features

- **Event Management**: Create and manage events with RSVP functionality
- **Organization System**: Organizations can host multiple events and manage members
- **User Authentication**: Secure registration and login system with session management
- **Event Discovery**: Explore events happening in your area
- **Member Management**: Handle organization memberships and event organizers
- **RSVP System**: Attendee management with capacity limits and RSVP deadlines

## Tech Stack

- **Frontend**: SvelteKit (Svelte 5) with Skeleton UI + Tailwind CSS
- **Backend**: Cloudflare Workers for serverless hosting
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM + Cloudflare KV

## Commands

- **Build**: `pnpm build`
- **Lint/Format**: `pnpm lint` (prettier + eslint)
- **Tests**: `pnpm test` (unit + e2e), `pnpm test:unit`, `pnpm test:e2e` (Build before running tests)
- **Single test**: `pnpm test:unit path/to/test.ts` or `npx playwright test path/to/test.ts`
- **Dev server**: `pnpm dev`
- **Type check**: `pnpm check`
- **DB operations**: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:studio`

## Project Structure

```text
src/
├── lib/
│   ├── db/           # Database schema and connection
│   ├── repos/        # Data access layer
│   └── utils/        # Utility functions
├── routes/
│   ├── (auth)/       # Authentication pages
│   ├── explore/      # Event and org explore page
│   ├── settings/     # Nested User/org settings
│   ├── org/[slug]/   # Org pages
│   ├── event/[slug]/ # Event pages
│   └── api/          # API endpoints
└── app.html          # Main HTML template
```

## Database Schema

The platform includes the following main entities:

- **Users**: User accounts with authentication
- **Organizations**: Event hosting organizations
- **Events**: Event details, dates, and capacity management
- **Attendees**: RSVP tracking
- **Sessions**: User session management

## Development Philosophy

### Core Beliefs

- **Incremental progress over big bangs** - Small changes that compile and pass tests
- **Learning from existing code** - Study and plan before implementing
- **Pragmatic over dogmatic** - Adapt to project reality
- **Clear intent over clever code** - Be boring and obvious

### Simplicity Means

- Single responsibility per function/class
- Avoid premature abstractions
- No clever tricks - choose the boring solution
- If you need to explain it, it's too complex

## Process

### 1. Planning & Staging

Break complex work into 3-5 stages.

```markdown
## Stage N: [Name]

**Goal**: [Specific deliverable]
**Success Criteria**: [Testable outcomes]
**Tests**: [Specific test cases]
**Status**: [Not Started|In Progress|Complete]
```

### 2. Implementation Flow

1. **Understand** - Study existing patterns in codebase
2. **Test** - Write test first (red)
3. **Implement** - Minimal code to pass (green)
4. **Refactor** - Clean up with tests passing
5. **Commit** - With clear message (conventional commit) linking to plan

### 3. When Stuck (After 3 Attempts)

**CRITICAL**: Maximum 3 attempts per issue, then STOP.

1. **Document what failed**:
   - What you tried
   - Specific error messages
   - Why you think it failed

2. **Research alternatives**:
   - Find 2-3 similar implementations
   - Note different approaches used

3. **Question fundamentals**:
   - Is this the right abstraction level?
   - Can this be split into smaller problems?
   - Is there a simpler approach entirely?

4. **Try different angle**:
   - Different library/framework feature?
   - Different architectural pattern?
   - Remove abstraction instead of adding?

## Code Style

- **Formatting**: Tabs, single quotes, 100 char width, no trailing commas
- **TypeScript**: Strict mode enabled, explicit types preferred
- **Imports**: Node.js imports use `node:` prefix, relative imports for local files
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Database**: Drizzle ORM with schema-first approach, UUID primary keys
- **Error handling**: Fail fast with descriptive messages, include context
- **Components**: Svelte 5 with runes, Skeleton UI + Tailwind CSS

## Architecture Principles

- **Composition over inheritance** - Use dependency injection
- **Interfaces over singletons** - Enable testing and flexibility
- **Explicit over implicit** - Clear data flow and dependencies
- **Test-driven when possible** - Never disable tests, fix them

## Patterns

- Repository pattern for data access (`src/lib/repos/`)
- Utility functions in `src/lib/utils/`
- Route-based organization with `+page.server.ts` for server logic
- Session-based auth with secure password hashing (scrypt + salt)

## Code Quality

- **Every commit must**:
  - Compile successfully
  - Pass all existing tests
  - Include tests for new functionality
  - Follow project formatting/linting

- **Before committing**:
  - Run formatters/linters
  - Self-review changes
  - Ensure commit message explains "why"

## Decision Framework

When multiple valid approaches exist, choose based on:

1. **Testability** - Can I easily test this?
2. **Readability** - Will someone understand this in 6 months?
3. **Consistency** - Does this match project patterns?
4. **Simplicity** - Is this the simplest solution that works?
5. **Reversibility** - How hard to change later?

## Project Integration

### Learning the Codebase

- Find 3 similar features/components
- Identify common patterns and conventions
- Use same libraries/utilities when possible
- Follow existing test patterns

### Tooling

- Use project's existing build system
- Use project's test framework
- Use project's formatter/linter settings
- Don't introduce new tools without strong justification

## Quality Gates

### Definition of Done

- [ ] Tests written and passing
- [ ] Code follows project conventions
- [ ] No linter/formatter warnings
- [ ] Commit messages are clear
- [ ] Implementation matches plan
- [ ] No TODOs without issue numbers

### Test Guidelines

- Test behavior, not implementation
- One assertion per test when possible
- Clear test names describing scenario
- Use existing test utilities/helpers
- Tests should be deterministic

## Important Reminders

**NEVER**:

- Use `--no-verify` to bypass commit hooks
- Disable tests instead of fixing them
- Commit code that doesn't compile
- Make assumptions - verify with existing code

**ALWAYS**:

- Commit working code incrementally
- Update plan documentation as you go
- Learn from existing implementations
- Stop after 3 failed attempts and reassess
