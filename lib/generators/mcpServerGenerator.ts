import { MCPServerConfig, MCPTool, MCPParameter, MCPResource, MCPPrompt, TransportType, SamplingConfig, ElicitationConfig } from '../types';

/**
 * Converts a name to snake_case for MCP tool identifiers
 */
function toSnakeCase(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

/**
 * Converts a ParameterType to Zod schema method with constraints
 */
function typeToZodSchema(param: MCPParameter): string {
  const baseSchema = (() => {
    switch (param.type) {
      case 'string':
        return buildStringSchema(param);
      case 'number':
        return buildNumberSchema(param);
      case 'boolean':
        return 'z.boolean()';
      case 'array':
        return buildArraySchema(param);
      case 'object':
        return 'z.record(z.unknown())';
      default:
        return 'z.unknown()';
    }
  })();

  const withDescription = `${baseSchema}.describe("${param.description.replace(/"/g, '\\"')}")`;

  // Add default value if specified
  const withDefault = param.default !== undefined
    ? `${withDescription}.default(${formatDefaultValue(param.default)})`
    : withDescription;

  return param.required ? withDefault : `${withDefault}.optional()`;
}

/**
 * Formats a default value for Zod schema generation
 */
function formatDefaultValue(value: string | number | boolean | unknown[] | Record<string, unknown>): string {
  if (typeof value === 'string') {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  // Arrays and objects
  return JSON.stringify(value);
}

/**
 * Builds a Zod string schema with enum, format, and length/pattern constraints
 */
function buildStringSchema(param: MCPParameter): string {
  // Handle enum constraint - use z.enum() for multiple values, z.literal() for single
  if (param.enum && param.enum.length > 0) {
    if (param.enum.length === 1) {
      return `z.literal("${param.enum[0].replace(/"/g, '\\"')}")`;
    }
    const enumValues = param.enum.map(v => `"${v.replace(/"/g, '\\"')}"`).join(', ');
    return `z.enum([${enumValues}])`;
  }

  const constraints: string[] = [];

  // Handle format constraint
  if (param.format) {
    switch (param.format) {
      case 'email':
        constraints.push('.email()');
        break;
      case 'uri':
        constraints.push('.url()');
        break;
      case 'uuid':
        constraints.push('.uuid()');
        break;
      case 'date-time':
        constraints.push('.datetime()');
        break;
      case 'date':
        constraints.push('.regex(/^\\d{4}-\\d{2}-\\d{2}$/)');
        break;
    }
  }

  // Handle length constraints
  if (param.minLength !== undefined) {
    constraints.push(`.min(${param.minLength})`);
  }

  if (param.maxLength !== undefined) {
    constraints.push(`.max(${param.maxLength})`);
  }

  // Handle pattern constraint
  if (param.pattern) {
    // Escape backslashes for the regex string
    const escapedPattern = param.pattern.replace(/\\/g, '\\\\');
    constraints.push(`.regex(new RegExp("${escapedPattern}"))`);
  }

  return `z.string()${constraints.join('')}`;
}

/**
 * Builds a Zod number schema with min/max constraints
 */
function buildNumberSchema(param: MCPParameter): string {
  const constraints: string[] = [];

  if (param.minimum !== undefined) {
    constraints.push(`.min(${param.minimum})`);
  }

  if (param.maximum !== undefined) {
    constraints.push(`.max(${param.maximum})`);
  }

  return `z.number()${constraints.join('')}`;
}

/**
 * Builds a Zod array schema with minItems, maxItems, and uniqueItems constraints
 */
function buildArraySchema(param: MCPParameter): string {
  const constraints: string[] = [];

  if (param.minItems !== undefined) {
    constraints.push(`.min(${param.minItems})`);
  }

  if (param.maxItems !== undefined) {
    constraints.push(`.max(${param.maxItems})`);
  }

  if (param.uniqueItems) {
    constraints.push(`.refine((arr) => new Set(arr).size === arr.length, { message: 'Items must be unique' })`);
  }

  return `z.array(z.unknown())${constraints.join('')}`;
}

/**
 * Generates Zod schema definition for a tool's parameters
 */
function generateZodSchema(tool: MCPTool): string {
  const toolId = toSnakeCase(tool.name);
  const schemaName = `${toolId.charAt(0).toUpperCase() + toolId.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase())}Schema`;

  if (tool.parameters.length === 0) {
    return `const ${schemaName} = z.object({});`;
  }

  const properties = tool.parameters
    .map(p => `  ${p.name}: ${typeToZodSchema(p)}`)
    .join(',\n');

  return `const ${schemaName} = z.object({\n${properties}\n});`;
}

/**
 * Generates sampling code for a tool
 */
function generateSamplingCode(config: SamplingConfig): string {
  const options: string[] = [
    `maxTokens: ${config.maxTokens}`,
  ];

  if (config.temperature !== undefined) {
    options.push(`temperature: ${config.temperature}`);
  }

  if (config.modelHint) {
    options.push(`modelHint: "${config.modelHint}"`);
  }

  if (config.systemPrompt) {
    options.push(`systemPrompt: "${config.systemPrompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`);
  }

  return `
      // Request LLM sampling from client
      const samplingResult = await server.createMessage({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "Your prompt here", // TODO: Customize the prompt
            },
          },
        ],
        ${options.join(',\n        ')},
      });

      // Handle sampling result
      const sampledContent = samplingResult.content;
`;
}

/**
 * Generates elicitation code for a tool
 */
function generateElicitationCode(config: ElicitationConfig): string {
  if (config.mode === 'url') {
    return `
      // Request user input via URL
      const elicitResult = await server.elicitInput({
        mode: "url",
        message: "${config.message.replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
        url: "${config.url || ''}",
      });

      // Handle elicitation result
      if (elicitResult.action === "cancel") {
        return {
          content: [{ type: "text", text: "User cancelled the operation" }],
          isError: true,
        };
      }
`;
  }

  // Form mode
  const schemaProperties: string[] = (config.formFields || []).map(field => {
    const prop: string[] = [`type: "${field.type}"`];
    if (field.description) {
      prop.push(`description: "${field.description.replace(/"/g, '\\"')}"`);
    }
    return `${field.name}: { ${prop.join(', ')} }`;
  });

  const requiredFields = (config.formFields || [])
    .filter(f => f.required)
    .map(f => `"${f.name}"`);

  return `
      // Request user input via form
      const elicitResult = await server.elicitInput({
        mode: "form",
        message: "${config.message.replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
        requestedSchema: {
          type: "object",
          properties: {
            ${schemaProperties.join(',\n            ')}
          },
          ${requiredFields.length > 0 ? `required: [${requiredFields.join(', ')}],` : ''}
        },
      });

      // Handle elicitation result
      if (elicitResult.action === "cancel") {
        return {
          content: [{ type: "text", text: "User cancelled the operation" }],
          isError: true,
        };
      }

      const userInput = elicitResult.content;
`;
}

/**
 * Generates the tool registration code using server.tool()
 */
function generateToolRegistration(tool: MCPTool): string {
  const toolId = toSnakeCase(tool.name);
  const schemaName = `${toolId.charAt(0).toUpperCase() + toolId.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase())}Schema`;

  // Build the parameter destructuring
  const paramNames = tool.parameters.map(p => p.name).join(', ');
  const handlerParams = tool.parameters.length > 0 ? `{ ${paramNames} }` : '_args';

  // Generate capability code blocks
  const samplingCode = tool.sampling?.enabled ? generateSamplingCode(tool.sampling) : '';
  const elicitationCode = tool.elicitation?.enabled ? generateElicitationCode(tool.elicitation) : '';

  // Build capability comments
  const capabilities: string[] = [];
  if (tool.sampling?.enabled) capabilities.push('Sampling');
  if (tool.elicitation?.enabled) capabilities.push('Elicitation');
  if (tool.tasks?.enabled) capabilities.push('Tasks (async)');
  const capabilitiesComment = capabilities.length > 0
    ? `\n * Capabilities: ${capabilities.join(', ')}`
    : '';

  return `/**
 * ${tool.icon} ${tool.name}
 * ${tool.description}${capabilitiesComment}
 */
server.tool(
  "${toolId}",
  ${schemaName}.shape,
  async (${handlerParams}) => {
    try {
      console.error(\`[${toolId}] Tool invoked\`);
${elicitationCode}${samplingCode}
      // TODO: Implement ${tool.name} logic here

      return {
        content: [
          {
            type: "text",
            text: \`${tool.name} executed successfully\`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(\`[${toolId}] Error:\`, error);
      return {
        content: [
          {
            type: "text",
            text: \`Error executing ${tool.name}: \${errorMessage}\`,
          },
        ],
        isError: true,
      };
    }
  }
);`;
}

/**
 * Generates resource registration code
 */
function generateResourceRegistration(resource: MCPResource): string {
  const resourceId = toSnakeCase(resource.name);

  return `/**
 * Resource: ${resource.name}
 * ${resource.description}
 * URI: ${resource.uri}
 */
server.resource(
  "${resourceId}",
  "${resource.uri}",
  async () => {
    try {
      console.error(\`[resource:${resourceId}] Fetching resource\`);

      // TODO: Implement resource fetching logic

      return {
        contents: [
          {
            uri: "${resource.uri}",
            mimeType: "${resource.mimeType}",
            text: "Resource content goes here",
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(\`[resource:${resourceId}] Error:\`, error);
      throw new Error(\`Failed to fetch resource: \${errorMessage}\`);
    }
  }
);`;
}

/**
 * Generates Zod schema for a prompt's arguments
 */
function generatePromptSchema(prompt: MCPPrompt): string {
  const promptId = toSnakeCase(prompt.name);
  const schemaName = `${promptId.charAt(0).toUpperCase() + promptId.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase())}PromptSchema`;

  if (prompt.arguments.length === 0) {
    return `const ${schemaName} = z.object({});`;
  }

  const properties = prompt.arguments
    .map(p => `  ${p.name}: ${typeToZodSchema(p)}`)
    .join(',\n');

  return `const ${schemaName} = z.object({\n${properties}\n});`;
}

/**
 * Generates prompt registration code
 */
function generatePromptRegistration(prompt: MCPPrompt): string {
  const promptId = toSnakeCase(prompt.name);
  const schemaName = `${promptId.charAt(0).toUpperCase() + promptId.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase())}PromptSchema`;

  const paramNames = prompt.arguments.map(p => p.name).join(', ');
  const handlerParams = prompt.arguments.length > 0 ? `{ ${paramNames} }` : '_args';

  return `/**
 * Prompt: ${prompt.name}
 * ${prompt.description}
 */
server.prompt(
  "${promptId}",
  ${schemaName}.shape,
  async (${handlerParams}) => {
    try {
      console.error(\`[prompt:${promptId}] Generating prompt\`);

      // TODO: Implement prompt template logic

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "${prompt.description}",
            },
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(\`[prompt:${promptId}] Error:\`, error);
      throw new Error(\`Failed to generate prompt: \${errorMessage}\`);
    }
  }
);`;
}

/**
 * Generates imports based on transport type
 */
function generateImports(transport: TransportType): string {
  if (transport === 'http') {
    return `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { Request, Response } from "express";
import cors from "cors";
import { z } from "zod";`;
  }

  return `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";`;
}

/**
 * Generates server startup code based on transport type
 */
function generateServerStartup(config: MCPServerConfig): string {
  const port = config.httpPort || 3000;

  if (config.transport === 'http') {
    return `// ============================================================================
// HTTP Server Setup
// ============================================================================

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", server: "${config.name}", version: "${config.version}" });
});

// Store active transports for cleanup
const transports: Map<string, SSEServerTransport> = new Map();

// SSE endpoint for MCP communication
app.get("/sse", async (req: Request, res: Response) => {
  console.error(\`[${config.name}] New SSE connection\`);

  const transport = new SSEServerTransport("/messages", res);
  const sessionId = crypto.randomUUID();
  transports.set(sessionId, transport);

  res.on("close", () => {
    console.error(\`[${config.name}] SSE connection closed\`);
    transports.delete(sessionId);
  });

  await server.connect(transport);
});

// Message endpoint for client-to-server communication
app.post("/messages", async (req: Request, res: Response) => {
  // Find the transport for this session (simplified - in production use session ID)
  const transport = Array.from(transports.values())[0];
  if (!transport) {
    res.status(400).json({ error: "No active SSE connection" });
    return;
  }

  await transport.handlePostMessage(req, res);
});

/**
 * Main entry point - starts the MCP server with HTTP/SSE transport
 */
async function main(): Promise<void> {
  const PORT = process.env.PORT || ${port};

  app.listen(PORT, () => {
    console.error(\`[${config.name}] MCP server running on http://localhost:\${PORT}\`);
    console.error(\`[${config.name}] Health check: http://localhost:\${PORT}/health\`);
    console.error(\`[${config.name}] SSE endpoint: http://localhost:\${PORT}/sse\`);
  });
}

main().catch((error) => {
  console.error("[${config.name}] Fatal error:", error);
  process.exit(1);
});`;
  }

  return `// ============================================================================
// Server Startup
// ============================================================================

/**
 * Main entry point - starts the MCP server with stdio transport
 */
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(\`[${config.name}] MCP server running on stdio\`);
}

main().catch((error) => {
  console.error("[${config.name}] Fatal error:", error);
  process.exit(1);
});`;
}

/**
 * Generates a complete MCP server from the configuration
 */
export function generateMCPServer(config: MCPServerConfig): string {
  const transport = config.transport || 'stdio';

  // Generate Zod schemas
  const toolSchemas = config.tools.map(generateZodSchema).join('\n\n');
  const promptSchemas = (config.prompts || []).map(generatePromptSchema).join('\n\n');

  // Generate registrations
  const toolRegistrations = config.tools.map(generateToolRegistration).join('\n\n');
  const resourceRegistrations = (config.resources || []).map(generateResourceRegistration).join('\n\n');
  const promptRegistrations = (config.prompts || []).map(generatePromptRegistration).join('\n\n');

  // Determine capabilities based on what's configured
  const capabilities: string[] = [];
  if (config.tools.length > 0) capabilities.push('tools: {}');
  if (config.tools.some(t => t.sampling?.enabled)) capabilities.push('sampling: {}');
  if (config.tools.some(t => t.elicitation?.enabled)) capabilities.push('elicitation: {}');
  if ((config.resources || []).length > 0) capabilities.push('resources: {}');
  if ((config.prompts || []).length > 0) capabilities.push('prompts: {}');
  const capabilitiesStr = capabilities.join(',\n      ');

  return `${generateImports(transport)}

/**
 * ${config.name}
 * Version: ${config.version}
 * Transport: ${transport}
 *
 * Generated by MCP Server Studio
 * https://mcp-server-studio.vercel.app
 */

// Initialize MCP Server
const server = new McpServer({
  name: "${config.name}",
  version: "${config.version}",
  capabilities: {
    ${capabilitiesStr}
  },
});

// ============================================================================
// Tool Schemas
// ============================================================================

${toolSchemas || '// No tools defined'}

${promptSchemas ? `// ============================================================================
// Prompt Schemas
// ============================================================================

${promptSchemas}` : ''}

// ============================================================================
// Tool Registrations
// ============================================================================

${toolRegistrations || '// No tools registered'}

${resourceRegistrations ? `// ============================================================================
// Resource Registrations
// ============================================================================

${resourceRegistrations}` : ''}

${promptRegistrations ? `// ============================================================================
// Prompt Registrations
// ============================================================================

${promptRegistrations}` : ''}

${generateServerStartup(config)}
`;
}
