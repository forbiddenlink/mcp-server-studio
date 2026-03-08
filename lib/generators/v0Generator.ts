/**
 * v0 API MCP Server Configuration Generator
 * 
 * Generates configuration for deploying MCP servers to Vercel v0 API
 * (v0 API added MCP support on March 6, 2026)
 */

import { MCPServerConfig } from "../types";

export interface V0Config {
  name: string;
  url: string;
  description?: string;
  auth?: {
    type: "bearer" | "basic" | "none";
    token?: string;
  };
}

/**
 * Generate v0 API MCP server configuration
 */
export function generateV0Config(config: MCPServerConfig): V0Config {
  const serverName = config.name || "my-mcp-server";
  const description = `MCP server with ${config.tools.length} tools, ${config.resources.length} resources, and ${config.prompts.length} prompts`;
  
  return {
    name: serverName,
    url: `https://mcp.${serverName.toLowerCase().replace(/\s+/g, "-")}.com`,
    description,
    auth: {
      type: "none" // Default to no auth for starter servers
    }
  };
}

/**
 * Generate v0 TypeScript integration code
 */
export function generateV0IntegrationCode(config: MCPServerConfig): string {
  const serverName = config.name || "my-mcp-server";
  const v0Config = generateV0Config(config);

  return `import { v0 } from "v0-sdk";

// Configure your MCP server
const server = await v0.mcpServers.create({
  name: "${v0Config.name}",
  url: "${v0Config.url}",
});

// Use in a v0 chat session
await v0.chats.create({
  message: "Build a ${serverName} integration",
  mcpServerIds: [server.id],
});`;
}

/**
 * Generate v0 deployment README section
 */
export function generateV0DeploymentDocs(config: MCPServerConfig): string {
  const serverName = config.name || "my-mcp-server";
  const integrationCode = generateV0IntegrationCode(config);

  return `## Deploy to Vercel v0

This MCP server is compatible with [Vercel v0 API](https://v0.app/docs/api/platform/reference/mcp-servers/create) (added March 6, 2026).

### Quick Start

1. **Deploy your MCP server** (choose one):
   \`\`\`bash
   # Deploy to Railway
   railway up

   # Or deploy to any HTTP-accessible endpoint
   docker-compose up -d
   \`\`\`

2. **Register with v0 API**:
   \`\`\`typescript
   ${integrationCode}
   \`\`\`

3. **Use in v0 Chat**:
   Once registered, your MCP server will be available in v0 chat sessions. The AI can call your tools to:
${config.tools.map(tool => `   - **${tool.name}**: ${tool.description}`).join('\n')}

### Configuration

Your server config:
- **Name**: ${serverName}
- **Transport**: ${config.transport || 'stdio'}
- **Tools**: ${config.tools.length}
- **Resources**: ${config.resources.length}
- **Prompts**: ${config.prompts.length}

### Next Steps

- Read [v0 MCP documentation](https://v0.app/docs/api/platform/reference/mcp-servers)
- Explore [MCP protocol spec](https://modelcontextprotocol.io)
- Join [MCP Discord community](https://discord.gg/mcp)
`;
}

/**
 * Generate complete v0 bundle (config + docs)
 */
export interface V0Bundle {
  config: V0Config;
  integrationCode: string;
  readme: string;
  quickstart: string;
}

export function generateV0Bundle(config: MCPServerConfig): V0Bundle {
  const v0Config = generateV0Config(config);
  const integrationCode = generateV0IntegrationCode(config);
  const readme = generateV0DeploymentDocs(config);

  const quickstart = `# Quick Start: Deploy to v0

## 1. Deploy Your Server

Choose your deployment method:

### Option A: Railway (Recommended)
\`\`\`bash
railway up
\`\`\`

### Option B: Docker
\`\`\`bash
docker-compose up -d
\`\`\`

### Option C: Node.js
\`\`\`bash
pnpm install
pnpm start
\`\`\`

## 2. Register with v0

\`\`\`typescript
${integrationCode}
\`\`\`

## 3. Test in v0 Chat

Your MCP server is now available! Try:
\`\`\`
${config.tools.length > 0 ? `Use ${config.tools[0].name} to ${config.tools[0].description}` : 'Test your MCP server'}
\`\`\`

---

**Server Details:**
- Name: ${config.name || 'my-mcp-server'}
- Tools: ${config.tools.length}
- Resources: ${config.resources.length}
- Prompts: ${config.prompts.length}

**Documentation:** See README.md for full details
`;

  return {
    config: v0Config,
    integrationCode,
    readme,
    quickstart
  };
}
