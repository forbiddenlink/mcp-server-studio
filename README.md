# ⚡ MCP Server Studio

**Visual builder for Model Context Protocol servers**

Build MCP servers with drag-and-drop tools, test them in real-time, and export production-ready TypeScript code.

![MCP Server Studio](https://img.shields.io/badge/Status-MVP-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🎯 What is this?

MCP Server Studio makes it easy to create [Model Context Protocol](https://modelcontextprotocol.io) servers without writing boilerplate code. Design your tools visually, test them in a playground, and export ready-to-use TypeScript code.

**Perfect for:**
- Building MCP servers quickly
- Learning the MCP specification
- Prototyping AI tool integrations
- Teaching MCP concepts visually

---

## ✨ Features

### 🎨 Visual Canvas
- Drag-and-drop tool creation
- 8 pre-built templates (Web Search, File Read, API Call, Database Query, Send Email, Create File, Run Command, Get Weather)
- Intuitive node-based interface
- Real-time manifest generation

### 🧪 Test Playground
- Simulated MCP server responses
- Chat-style interface
- Instant tool call testing
- Parameter validation

### 💻 Code Generation
- Production-ready TypeScript output
- Full MCP SDK integration
- Proper error handling
- Clean, readable code

### 🎨 Modern UI
- Dark theme with glassmorphism
- Futuristic design
- Smooth animations
- Responsive layout

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-server-studio.git
cd mcp-server-studio

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:3000`

---

## 📖 How to Use

### 1. Add Tools
Click **"Add Tool"** and select a template. The tool appears on the canvas as a node.

### 2. Configure
Click a tool node to open the configuration panel:
- Edit tool name and description
- Add/remove parameters
- Set parameter types (string, number, boolean, array, object)
- Mark parameters as required

### 3. Test
Switch to the **Test tab** and send prompts:
```
"Search for TypeScript best practices"
"Read package.json"
"Get weather for New York"
```

The simulator matches your prompt to tools and shows responses.

### 4. Export
Click **"Export Server"** to download a complete TypeScript MCP server ready to run:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
// ... full working code
```

---

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type safety (strict mode) |
| **React Flow** | Visual canvas and node system |
| **Zustand** | Global state management |
| **Monaco Editor** | Code preview/export |
| **shadcn/ui** | UI component library |
| **Tailwind CSS** | Styling with custom theme |
| **Framer Motion** | Animations |

---

## 📂 Project Structure

```
mcp-server-studio/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main app page
├── components/
│   ├── canvas/            # React Flow canvas
│   │   ├── CanvasPanel.tsx
│   │   └── ToolNode.tsx
│   ├── config/            # Tool configuration
│   │   └── ToolConfigPanel.tsx
│   ├── preview/           # Preview tabs
│   │   ├── PreviewPanel.tsx
│   │   ├── StructureTab.tsx
│   │   ├── TestTab.tsx
│   │   └── CodeTab.tsx
│   └── ui/                # shadcn components
├── lib/
│   ├── generators/        # Code generation
│   │   ├── mcpServerGenerator.ts
│   │   └── manifestGenerator.ts
│   ├── simulators/        # Test simulation
│   │   └── mcpTestSimulator.ts
│   ├── store/             # Zustand store
│   │   └── useStore.ts
│   ├── templates/         # Pre-built tools
│   │   └── toolTemplates.ts
│   └── types.ts           # TypeScript types
└── docs/
    └── plans/             # Design documents
```

---

## 🎨 Design Philosophy

**Futuristic & Premium**
- Dark theme (#0a0a0f base)
- Glassmorphism effects
- Indigo/purple accents
- Smooth animations

**User Experience**
- Minimal clicks to value
- Real-time feedback
- Clear visual hierarchy
- Helpful empty states

---

## 🗺️ Roadmap

### Current (MVP)
- [x] Visual tool builder
- [x] 8 pre-built templates
- [x] Test playground
- [x] TypeScript code generation
- [x] Export functionality

### Next
- [ ] Save/load projects (localStorage)
- [ ] Custom tool icons
- [ ] Advanced parameter types
- [ ] npm package scaffolding
- [ ] Import existing MCP servers
- [ ] Team sharing (QR codes)

### Future
- [ ] User accounts
- [ ] Marketplace
- [ ] Version control
- [ ] AI code suggestions
- [ ] Workflow connections

---

## 🤝 Contributing

Contributions welcome! This is a portfolio project but PRs are appreciated.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic
- [React Flow](https://reactflow.dev) for the amazing canvas library
- [shadcn/ui](https://ui.shadcn.com) for beautiful components
- [Vercel](https://vercel.com) for deployment

---

## 📧 Contact

Built by **Liz Stein** as part of a portfolio project series.

- Portfolio: [your-portfolio.com](#)
- GitHub: [@yourusername](#)
- LinkedIn: [linkedin.com/in/yourprofile](#)

---

**⚡ Start building MCP servers visually!**
