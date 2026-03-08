# ⚡ MCP Server Studio

**Visual builder for Model Context Protocol servers**

Design MCP tools, resources, and prompts on a drag-and-drop canvas. Test them in a built-in simulator. Export production-ready TypeScript server code with Docker and Railway deployment bundles.

![CI](https://github.com/lizstein/mcp-server-studio/actions/workflows/ci.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tests](https://img.shields.io/badge/Tests-466_passing-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## What is this?

MCP Server Studio makes it easy to create [Model Context Protocol](https://modelcontextprotocol.io) servers without writing boilerplate code. Design your tools visually, test them in a playground, and export ready-to-use TypeScript code.

**Perfect for:**
- Building MCP servers quickly
- Learning the MCP specification
- Prototyping AI tool integrations
- Teaching MCP concepts visually

---

## Features

**Visual Canvas** — Drag-and-drop tool, resource, and prompt creation with 29 templates across 7 categories. Intuitive node-based interface with real-time manifest generation.

**Test Simulator** — Interactive test inspector with parameter validation, batch schema validation, and structured test results for tools, resources, and prompts.

**Code Generation** — Production-ready TypeScript with Zod schemas, full MCP SDK integration, proper error handling, and support for both stdio and HTTP/SSE transports.

**Export & Deploy** — Export as TypeScript, Docker bundle, or Railway bundle. Includes Dockerfile, docker-compose, package.json, tsconfig, and deployment instructions.

**AI Tool Generator** — Describe a tool in natural language and the parser generates a full MCP tool definition with parameters, types, and icons.

**OpenAPI Import** — Paste an OpenAPI/Swagger spec (JSON or YAML) and automatically convert API operations to MCP tools.

**Advanced Capabilities** — Configure sampling (LLM inference), elicitation (user input), and tasks (async operations) on a per-tool basis.

---

## Quick Start

**Prerequisites:** Node.js 18+ and pnpm 8+

```bash
git clone https://github.com/lizstein/mcp-server-studio.git
cd mcp-server-studio
pnpm install
pnpm dev
```

Visit `http://localhost:3000`

---

## Development

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build (includes TypeScript checking)
pnpm lint         # ESLint (flat config, strict no-explicit-any)
pnpm test:run     # Vitest single run (466 tests)
pnpm test         # Vitest watch mode
```

Run a single test file:
```bash
pnpm vitest run lib/generators/__tests__/constraints.test.ts
```

---

## Tech Stack

- **Next.js 16** — React 19, App Router, Turbopack
- **TypeScript 5** — Strict mode
- **React Flow** (`@xyflow/react`) — Visual canvas and node system
- **Zustand** — Global state management with localStorage persistence
- **Monaco Editor** — Code preview and export
- **shadcn/ui + Radix** — UI component library
- **Tailwind CSS v4** — Styling with custom dark theme
- **Framer Motion** — Animations
- **Vitest** — Testing with jsdom environment

---

## Project Structure

```
mcp-server-studio/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout with metadata
│   └── page.tsx                 # Main app page (client component)
├── components/
│   ├── canvas/                  # React Flow canvas
│   │   ├── CanvasPanel.tsx      # Main canvas with toolbar
│   │   ├── ToolNode.tsx         # Tool node component
│   │   ├── ResourceNode.tsx     # Resource node component
│   │   ├── PromptNode.tsx       # Prompt node component
│   │   └── DataFlowEdge.tsx     # Custom edge component
│   ├── config/                  # Slide-in configuration panels
│   │   ├── ToolConfigPanel.tsx
│   │   ├── ResourceConfigPanel.tsx
│   │   ├── PromptConfigPanel.tsx
│   │   ├── ServerConfigPanel.tsx
│   │   ├── CapabilitiesSection.tsx
│   │   ├── SamplingConfigPanel.tsx
│   │   └── ElicitationConfigPanel.tsx
│   ├── preview/                 # Right sidebar tabs
│   │   ├── PreviewPanel.tsx     # Tab container
│   │   ├── StructureTab.tsx     # JSON manifest viewer
│   │   ├── TestTab.tsx          # Interactive test simulator
│   │   └── CodeTab.tsx          # Monaco code editor
│   └── ui/                      # shadcn/ui + custom components
│       ├── ai-generator.tsx     # Natural language tool generator
│       ├── command-palette.tsx  # Cmd+K command palette
│       ├── import-dialog.tsx    # OpenAPI import dialog
│       ├── template-gallery.tsx # Template browser
│       └── error-boundary.tsx   # React error boundary
├── lib/
│   ├── generators/              # Code generation (pure functions)
│   │   ├── mcpServerGenerator.ts
│   │   ├── manifestGenerator.ts
│   │   ├── dockerGenerator.ts
│   │   ├── railwayGenerator.ts
│   │   ├── readmeGenerator.ts
│   │   ├── exportBundler.ts
│   │   ├── zipCreator.ts
│   │   ├── aiToolGenerator.ts
│   │   └── __tests__/           # Generator tests
│   ├── importers/
│   │   ├── openApiImporter.ts
│   │   └── __tests__/           # Importer tests
│   ├── simulators/
│   │   ├── mcpTestSimulator.ts
│   │   └── __tests__/           # Simulator tests
│   ├── store/
│   │   └── useStore.ts          # Zustand store with undo/redo
│   ├── utils/
│   │   ├── sanitize.ts          # Code generation sanitization
│   │   └── __tests__/           # Utility tests
│   ├── templates/
│   │   └── toolTemplates.ts     # 29 pre-built tool templates
│   └── types.ts                 # TypeScript type definitions
└── .github/workflows/ci.yml    # CI pipeline (lint, test, build)
```

---

## Testing

183 tests across 10 test files covering:
- Zod schema generation with all constraint types
- JSON Schema manifest generation
- Runtime parameter validation (all types and formats)
- MCP server code generation (stdio + HTTP transports)
- Docker and Railway config generation
- OpenAPI/Swagger import parsing
- AI tool description parsing
- Test simulator execution and batch validation
- Export bundle composition
- Input sanitization for safe code generation

---

## Roadmap

### Done
- [x] Visual tool, resource, and prompt builder
- [x] 29 templates across 7 categories
- [x] Interactive test simulator
- [x] TypeScript code generation (stdio + HTTP/SSE)
- [x] Docker and Railway deployment exports
- [x] AI tool generator (natural language → MCP tool)
- [x] OpenAPI/Swagger import
- [x] Sampling, elicitation, and tasks configuration
- [x] Undo/redo with history stack
- [x] Command palette (Cmd+K)
- [x] localStorage persistence
- [x] CI pipeline

### Next
- [ ] Custom tool icons
- [ ] npm package scaffolding
- [ ] Team sharing
- [ ] Workflow connections between tools

---

## Contributing

Contributions welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details

---

## Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic
- [React Flow](https://reactflow.dev) for the canvas library
- [shadcn/ui](https://ui.shadcn.com) for UI components
- [Vercel](https://vercel.com) for deployment

---

Built by **Liz Stein**.

**⚡ Start building MCP servers visually!**
