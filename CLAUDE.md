# CLAUDE.md

Guidance for Claude Code (and any other agent reading via the AGENTS.md symlink) when working
in this repository.

## Overview

MCP Server Studio is a visual builder for Model Context Protocol (MCP) servers. Users design
tools, resources, and prompts on a drag-and-drop canvas, test them in a simulator, and export
production-ready TypeScript MCP server code. It is a single-page Next.js app with no backend
(no API routes under app/) - all logic runs client-side in `app/page.tsx`.

## Stack

- Next.js 16, React 19.2
- TypeScript 7 (strict, no separate typecheck script - `pnpm build` runs TS checking)
- React Flow (`@xyflow/react`) for the canvas
- Zustand for editor state
- Monaco Editor for code preview
- Tailwind CSS 4, Radix / shadcn-style UI primitives
- Vitest (jsdom) for tests
- Biome for lint and format
- pnpm (`packageManager: pnpm@10.34.5`, `pnpm-lock.yaml`)

## Commands

- `pnpm dev` - Next.js dev server on localhost:3000
- `pnpm build` - production build, includes TypeScript strict checking
- `pnpm lint` / `pnpm lint:fix` - Biome lint (the actual lint path; `eslint.config.mjs` exists
  but nothing in `package.json` scripts or CI invokes it)
- `pnpm biome:check` / `pnpm biome:fix` / `pnpm biome:format` - Biome check/format variants
- `pnpm test` / `pnpm test:watch` - Vitest watch mode
- `pnpm test:run` - Vitest single run (CI-friendly)
- `pnpm test:coverage` - Vitest with coverage
- `pnpm presubmit` - lint + test:run + build, same sequence CI runs
- Single test file: `pnpm exec vitest run lib/generators/__tests__/constraints.test.ts`
- `pnpm analyze` - bundle analyzer build (`ANALYZE=true next build`)

## Layout

- `app/` - Next.js App Router: `layout.tsx`, `page.tsx` (root client page), `globals.css`
- `components/canvas/` - React Flow canvas: `CanvasPanel`, `ToolNode`, `ResourceNode`,
  `PromptNode`, `DataFlowEdge`, `QuickAddMenu`
- `components/config/` - slide-in config panels: `ToolConfigPanel`, `ResourceConfigPanel`,
  `PromptConfigPanel`, `ServerConfigPanel`, `CapabilitiesSection`, `ElicitationConfigPanel`,
  `SamplingConfigPanel`
- `components/preview/` - `PreviewPanel`, `StructureTab` (JSON manifest), `TestTab`
  (interactive testing), `CodeTab` (Monaco editor)
- `components/ui/` - shadcn-style primitives plus `ai-generator`, `command-palette`,
  `import-dialog`, `template-gallery`
- `lib/generators/` - pure `MCPServerConfig -> string` functions: `mcpServerGenerator.ts`
  (full TS server, stdio or HTTP/SSE), `manifestGenerator.ts`, `dockerGenerator.ts`,
  `railwayGenerator.ts`, `readmeGenerator.ts`, `v0Generator.ts` (Vercel v0 API MCP config),
  `exportBundler.ts` (orchestrates bundles), `zipCreator.ts`, `aiToolGenerator.ts` (heuristic
  natural-language-to-tool parsing, no LLM call)
- `lib/importers/openApiImporter.ts` - parses OpenAPI/Swagger JSON or simple YAML into tools
- `lib/simulators/mcpTestSimulator.ts` - client-side test simulator (`validateParameters`,
  `executeTool`, `testResource`, `testPrompt`, `runBatchValidation`)
- `lib/store/useStore.ts` - the single Zustand store (see Conventions)
- `lib/templates/` - `toolTemplates.ts`, `templateCategories.ts`
- `lib/utils/sanitize.ts`, `lib/types.ts` - shared domain model types
- `src/env.ts` - `@t3-oss/env-nextjs` schema (see Gotchas - currently stale/unused)
- `src/lib/` - `logger.ts` (next-axiom), `safe-action.ts` (next-safe-action client),
  `mcp-validator.ts` (separate Ajv/Zod MCP spec validator, distinct from the simulator above)
- `src/mocks/` - MSW handlers/server/browser setup (example CRUD/auth handlers, not wired to
  any real API since the app has no backend)
- `docs/` - `GETTING_STARTED.md`

## Conventions

- All state lives in `lib/store/useStore.ts`, persisted to localStorage: `tools`, `resources`,
  `prompts` (the MCP server definition), `nodes`/`edges` (React Flow canvas state kept in sync
  with the domain arrays), `serverConfig`, and an undo/redo `history`/`historyIndex` stack
  (max 50 entries). A tool's `id` is also its React Flow node `id`.
- History management in `useStore.ts` is intentionally repetitive - each action independently
  manages its own history snapshot for reliability. Do not DRY it up without careful testing.
- React Flow `as NodeTypes` / `as EdgeTypes` casts in canvas code are deliberate (React Flow's
  generics don't fit memo'd components) - leave them.
- ID convention: `tool-{timestamp}`, `resource-{uuid}`, `prompt-{uuid}`.
- Transport modes (`stdio` vs `http`) produce substantially different generated server code in
  `mcpServerGenerator.ts` (HTTP adds Express, SSE, health checks, CORS). Test both when
  changing that generator.
- Parameter constraints flow through three parallel systems - Zod schema generation, JSON
  Schema manifest, and runtime validation - plus the README generator. Update all four
  together.
- Dark theme via CSS custom properties in `app/globals.css` (`--bg-base`, `--bg-surface`,
  `--text-primary`, `--accent`, glassmorphism `surface-*` utility classes).

## Testing

Tests live under each module's `__tests__/` directory (`lib/generators/__tests__/`,
`components/*/__tests__/`), using Vitest with jsdom (`vitest-setup.ts`, `@` alias to repo
root). Do not hard-code a test count; use `pnpm test:run` or CI as the source of truth.

## Env vars

No `.env.example` exists in this repo. The only declared env vars are in `src/env.ts` (see
Gotchas - unused dead code). Cannot verify `.env.local` contents (not readable); do not assume
it matches `src/env.ts`.

## Gotchas

- `src/env.ts` requires `ARCJET_KEY` and `GROQ_API_KEY` (non-optional server vars) and
  `NEXT_PUBLIC_POSTHOG_KEY` (non-optional client var), but nothing in `app/`, `components/`,
  or `lib/` imports `src/env.ts`, and the Arcjet package is not a dependency in `package.json`
  (it was removed - see `package.json.bak`). This schema looks like leftover scaffolding from
  a template and is currently dead code (orphaned scaffolding, left over after Arcjet's
  removal).
- `eslint.config.mjs` exists (Next.js flat config) but is not run by any `package.json` script
  or by CI (`.github/workflows/ci.yml` runs `pnpm lint`, which is Biome). Do not assume ESLint
  is the enforced linter.
- `src/mocks/handlers.ts` (MSW) defines example CRUD/auth endpoints that do not correspond to
  any real route in this app (there is no backend).
- Two separate MCP validators exist: `lib/simulators/mcpTestSimulator.ts` (used by the UI test
  tab) and `src/lib/mcp-validator.ts` (Ajv/Zod spec validation). They are not the same code
  path.

## Claude Code specifics

- `.claude/settings.local.json` holds local permission overrides only; there are no project
  skills, agents, hooks, or rules directories under .claude.
