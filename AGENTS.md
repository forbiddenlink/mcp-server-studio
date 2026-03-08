# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

MCP Server Studio is a visual builder for Model Context Protocol (MCP) servers. Users design tools, resources, and prompts on a drag-and-drop canvas, test them in a simulator, and export production-ready TypeScript MCP server code. It's a single-page Next.js 15 app with no backend — all logic runs client-side.

## Commands

- `pnpm dev` — Start Next.js dev server on localhost:3000
- `pnpm build` — Production build (runs TypeScript checking via Next.js)
- `pnpm lint` — ESLint (flat config, strict `no-explicit-any`)
- `pnpm test` — Vitest in watch mode
- `pnpm test:run` — Vitest single run (CI-friendly)
- Run a single test file: `pnpm vitest run lib/generators/__tests__/constraints.test.ts`

There is no separate `typecheck` script — `pnpm build` runs TypeScript strict checking.

## Architecture

### Data Flow

All state lives in a single Zustand store (`lib/store/useStore.ts`) persisted to localStorage. The store holds:
- `tools: MCPTool[]`, `resources: MCPResource[]`, `prompts: MCPPrompt[]` — the user's MCP server definition
- `nodes: Node[]`, `edges: Edge[]` — React Flow canvas state, kept in sync with tools/resources/prompts
- `serverConfig: MCPServerConfig` — server metadata (name, version, transport type)
- `history` / `historyIndex` — undo/redo stack (max 50 entries)

Every mutation (add/update/delete tool/resource/prompt) pushes to the history stack and updates both the domain model arrays AND the `serverConfig` aggregate. Node positions are tied to entity IDs — a tool's `id` is also its React Flow node `id`.

### Code Generation Pipeline

The generators in `lib/generators/` are pure functions: `MCPServerConfig → string`. They produce:
- `mcpServerGenerator.ts` — Full TypeScript MCP server with Zod schemas, tool/resource/prompt registrations, and transport setup (stdio or HTTP/SSE)
- `manifestGenerator.ts` — JSON Schema manifest of all tools
- `dockerGenerator.ts` — Dockerfile, .dockerignore, docker-compose.yml
- `railwayGenerator.ts` — railway.json, railway.toml, .env.railway
- `readmeGenerator.ts` — README.md, package.json, tsconfig.json, claude_desktop_config.json
- `exportBundler.ts` — Orchestrates the above into export bundles (TypeScript-only, Docker zip, Railway zip)
- `zipCreator.ts` — Creates zip blobs via JSZip

The `aiToolGenerator.ts` uses heuristic pattern-matching (no LLM) to parse natural language tool descriptions into `MCPTool` definitions. The `openApiImporter.ts` parses OpenAPI/Swagger specs (JSON or simple YAML) into tool arrays.

### Component Structure

- `app/page.tsx` — Root page ("use client"), wires together canvas, preview panel, config panels, command palette, and server settings
- `components/canvas/` — React Flow canvas: `CanvasPanel` (main), `ToolNode`, `ResourceNode`, `PromptNode`, `DataFlowEdge`
- `components/config/` — Slide-in config panels: `ToolConfigPanel`, `ResourceConfigPanel`, `PromptConfigPanel`, `ServerConfigPanel`, `CapabilitiesSection`, `ElicitationConfigPanel`, `SamplingConfigPanel`
- `components/preview/` — Right sidebar tabs: `PreviewPanel`, `StructureTab` (JSON manifest), `TestTab` (interactive testing), `CodeTab` (Monaco editor)
- `components/ui/` — shadcn/ui primitives + custom: `ai-generator`, `command-palette`, `import-dialog`, `template-gallery`

### Test Simulator

`lib/simulators/mcpTestSimulator.ts` provides client-side testing:
- `validateParameters()` — Validates values against `MCPParameter[]` schema (enum, format, min/max, pattern, uniqueItems)
- `executeTool()` / `testResource()` / `testPrompt()` — Simulated execution with validation
- `runBatchValidation()` — Validates all tools/resources/prompts schemas
- `simulateToolCall()` / `generateChatResponse()` — Legacy chat-based keyword matching

### Type System

All types are in `lib/types.ts`. Key types:
- `MCPTool` — Tool with parameters, optional sampling/elicitation/tasks configs
- `MCPParameter` — Parameter with type, constraints (enum, format, min/max, pattern, minLength, maxLength, minItems, maxItems, uniqueItems, default)
- `MCPResource` — URI-based resource with mimeType
- `MCPPrompt` — Prompt template with reusable MCPParameter arguments
- `MCPServerConfig` — Aggregate of name, version, transport, tools, resources, prompts

## Key Patterns

- **React Flow `as` casts**: Node/edge types use `as NodeTypes` / `as EdgeTypes` because React Flow's generic types are incompatible with memo'd components. This is intentional — don't try to fix it further.
- **History management**: The `useStore.ts` history code is highly repetitive by design — each action (addTool, updateTool, deleteTool, addResource, etc.) independently manages history snapshots for reliability. Don't try to DRY this up without careful testing.
- **ID convention**: Tool/resource/prompt IDs use `tool-{timestamp}`, `resource-{uuid}`, `prompt-{uuid}`. The canvas creates React Flow nodes with the same ID as the entity.
- **Transport modes**: Generated server code differs substantially between `stdio` and `http` transport. HTTP adds Express, SSE, health checks, CORS. Both paths need testing when modifying `mcpServerGenerator.ts`.
- **Parameter constraints**: Constraints flow through three parallel systems — Zod schema generation, JSON Schema manifest, and runtime validation. Changes to constraint handling must update all three plus the README generator.

## Testing

Tests live in `lib/generators/__tests__/`. They cover:
- Zod schema generation with all constraint types
- JSON Schema manifest generation
- Runtime parameter validation
- README documentation generation
- Export bundler file composition
- Railway config generation
- Zip creation

Tests use Vitest with jsdom environment. The `@` path alias resolves to project root via `vitest.config.ts`.

## Styling

Dark theme using CSS custom properties defined in `app/globals.css`. Key design tokens:
- `--bg-base`, `--bg-surface`, `--bg-elevated`, `--bg-hover`
- `--text-primary`, `--text-secondary`, `--text-tertiary`
- `--accent` (indigo), `--border-default`, `--border-strong`
- Glassmorphism via `surface-overlay`, `surface-base`, `surface-elevated` utility classes
- Tailwind CSS v4 with `@tailwindcss/postcss`
