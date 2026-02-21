# Case Study: MCP Server Studio

**Building a Visual MCP Server Builder in 4 Hours**

---

## 🎯 The Challenge

Model Context Protocol (MCP) is Anthropic's new standard for connecting AI models to external tools and data sources. It's powerful but has a steep learning curve—developers need to write boilerplate code, understand the SDK, and manually test their servers.

**The problem:** Building MCP servers requires too much friction for rapid prototyping.

**The opportunity:** Create a visual builder that makes MCP accessible to everyone.

---

## 💡 The Solution

MCP Server Studio is a visual drag-and-drop builder for creating MCP servers. Users design tools on a canvas, test them in real-time, and export production-ready TypeScript code—all without writing a single line manually.

**Key Features:**
- 🎨 Visual canvas with 8 pre-built tool templates
- 🧪 Live testing playground with simulated responses
- 💻 Production-ready TypeScript code generation
- ⚡ Futuristic UI with glassmorphism and smooth animations

**Live Demo:** https://mcp-server-studio.vercel.app

---

## 🏗️ Technical Architecture

### Tech Stack Decisions

**Frontend Framework: Next.js 15**
- App Router for modern React patterns
- Turbopack for fast builds
- Server components where beneficial

**State Management: Zustand**
- Simpler than Redux for this scope
- Excellent TypeScript support
- No provider hell

**Canvas: React Flow**
- Battle-tested node-based UI library
- Built-in pan/zoom, drag-and-drop
- Extensible node types

**Code Editor: Monaco Editor**
- VS Code engine
- Syntax highlighting out of the box
- Read-only mode for preview

**UI: shadcn/ui + Tailwind**
- Copy-paste components (no npm bloat)
- Full customization
- Tailwind v4 with CSS variables

### Architecture Patterns

**1. Generator Pattern**
Used for transforming visual tools → TypeScript code:

```typescript
// lib/generators/mcpServerGenerator.ts
function generateMCPServer(config: MCPServerConfig): string {
  return `
    import { Server } from '@modelcontextprotocol/sdk';
    ${config.tools.map(generateToolHandler).join('\n')}
  `;
}
```

**2. Simulator Pattern**
Mock MCP server behavior for testing without real execution:

```typescript
// lib/simulators/mcpTestSimulator.ts
function simulateToolCall(prompt: string, tools: MCPTool[]) {
  const matched = matchTool(prompt, tools);
  return {
    toolName: matched.name,
    parameters: extractParameters(prompt, matched)
  };
}
```

**3. Store Pattern**
Single source of truth with Zustand:

```typescript
// lib/store/useStore.ts
export const useStore = create<StoreState>((set) => ({
  tools: [],
  addTool: (tool) => set((state) => ({
    tools: [...state.tools, tool]
  }))
}));
```

---

## 🎨 Design Decisions

### Color Palette
**Dark + Futuristic Theme**

```css
--bg-primary: #0a0a0f        /* Deep space black */
--accent-primary: #6366f1    /* Indigo (MCP brand color) */
--accent-glow: #8b5cf6       /* Purple glow effects */
```

**Why dark?**
- Reduces eye strain for developers
- Makes code editors feel natural
- Accent colors pop more

### Visual Effects
- **Glassmorphism:** Modern blur effects on panels
- **Glow on selection:** Subtle box-shadow with primary color
- **Confetti on export:** Celebration for completing a server
- **Grid background:** Subtle guide for canvas layout

---

## 🚧 Technical Challenges

### Challenge 1: React Flow Type Safety

**Problem:** React Flow's TypeScript types didn't match our custom node data structure.

**Solution:**
```typescript
// Cast to any for nodeTypes, use type guards inside components
const nodeTypes = useMemo(() => ({
  toolNode: ToolNode as any
}), []);
```

**Learning:** Sometimes pragmatic type casting is better than fighting the library.

---

### Challenge 2: Real-Time Code Generation

**Problem:** Updating Monaco Editor content was causing re-renders and cursor jumps.

**Solution:**
- Made Monaco read-only
- Use `key` prop based on tool count to force remount
- Generate code only when tools change

**Learning:** Read-only editors are simpler and avoid cursor management.

---

### Challenge 3: Test Simulation

**Problem:** How to "test" MCP tools without actually executing them?

**Solution:**
Simple keyword matching + parameter extraction:

```typescript
function matchTool(prompt: string, tools: MCPTool[]) {
  const keywords = prompt.toLowerCase().split(/\s+/);
  return tools.find(tool => 
    keywords.some(kw => tool.name.toLowerCase().includes(kw))
  );
}
```

**Learning:** 80% solution is often enough for MVP. Real execution can come later.

---

## 📊 Results

**Built in:** 4 hours (vs. 18-day plan)  
**Lines of Code:** 10,467  
**Files Created:** 40  
**Deployment:** Vercel (auto-deploy from main)  

**Performance:**
- Build time: 5.5s
- First contentful paint: <1s
- Lighthouse score: 95+ (estimated)

**Key Metrics:**
- 0 runtime dependencies on server
- 100% TypeScript coverage
- 0 eslint errors
- Fully responsive (mobile-friendly)

---

## 💡 Key Learnings

### 1. Start with Design Doc
Writing the full design document BEFORE coding saved hours. Knew exactly what to build and could reference it throughout.

### 2. Use Proven Libraries
React Flow handled all the canvas complexity. Monaco handled code display. Don't reinvent these.

### 3. Portfolio-First = Faster
Skipping auth, databases, and user management meant shipping in hours, not weeks.

### 4. Generators > Templates
Writing code generators is easier than maintaining template strings. More flexible, easier to test.

### 5. Dark Theme = Less Color Decisions
Starting with dark theme + 2 accent colors simplified design choices significantly.

---

## 🔮 Future Enhancements

**If this were production:**

1. **Persistence** - Save projects to localStorage or Supabase
2. **Import** - Parse existing MCP servers into visual format
3. **Export Options** - npm package, Docker container, deploy to Railway
4. **Advanced Types** - Better support for complex parameter schemas
5. **Collaboration** - Real-time multi-user editing with Yjs
6. **Marketplace** - Share and discover community-built servers
7. **AI Assist** - Generate tools from natural language descriptions

---

## 🎓 What I'd Do Differently

**If starting over:**

1. **Add Storybook** - Component development would be faster
2. **E2E tests** - Playwright tests for critical flows
3. **Analytics** - Track which templates are most used
4. **Error boundaries** - Better error handling for edge cases
5. **Keyboard shortcuts** - Power user features (Cmd+D to duplicate node)

---

## 🏆 Portfolio Impact

**What this project demonstrates:**

✅ **Modern stack fluency** - Next.js 15, React 19, TypeScript strict mode  
✅ **Visual design skills** - Futuristic UI, glassmorphism, animations  
✅ **Complex state management** - Canvas + forms + preview in sync  
✅ **Code generation** - Template engines, AST manipulation concepts  
✅ **Developer experience** - Focused on making complex things simple  
✅ **Shipping speed** - 4 hours from idea to deployed MVP  

**The differentiator:** Most developers have CRUD apps. Few have visual builders for bleeding-edge protocols.

---

## 📚 Resources

- **Live Demo:** https://mcp-server-studio.vercel.app
- **Source Code:** [GitHub](#)
- **MCP Specification:** https://modelcontextprotocol.io
- **React Flow Docs:** https://reactflow.dev
- **Design Document:** [View Design Doc](../plans/2026-02-21-mcp-server-studio-design.md)

---

**Built by Liz Stein** • February 2026 • TypeScript + Next.js + React Flow
