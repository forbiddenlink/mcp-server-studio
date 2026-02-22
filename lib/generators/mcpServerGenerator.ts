import { MCPServerConfig, MCPTool, MCPParameter, MCPResource, MCPPrompt } from '../types';

/**
 * Converts a name to snake_case for MCP tool identifiers
 */
function toSnakeCase(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

/**
 * Converts a ParameterType to Zod schema method
 */
function typeToZodSchema(param: MCPParameter): string {
  const baseSchema = (() => {
    switch (param.type) {
      case 'string':
        return 'z.string()';
      case 'number':
        return 'z.number()';
      case 'boolean':
        return 'z.boolean()';
      case 'array':
        return 'z.array(z.unknown())';
      case 'object':
        return 'z.record(z.unknown())';
      default:
        return 'z.unknown()';
    }
  })();

  const withDescription = `${baseSchema}.describe("${param.description.replace(/"/g, '\\"')}")`;
  return param.required ? withDescription : `${withDescription}.optional()`;
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
 * Generates the tool registration code using server.tool()
 */
function generateToolRegistration(tool: MCPTool): string {
  const toolId = toSnakeCase(tool.name);
  const schemaName = `${toolId.charAt(0).toUpperCase() + toolId.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase())}Schema`;

  // Build the parameter destructuring
  const paramNames = tool.parameters.map(p => p.name).join(', ');
  const handlerParams = tool.parameters.length > 0 ? `{ ${paramNames} }` : '_args';

  return `/**
 * ${tool.icon} ${tool.name}
 * ${tool.description}
 */
server.tool(
  "${toolId}",
  ${schemaName}.shape,
  async (${handlerParams}) => {
    try {
      console.error(\`[${toolId}] Tool invoked\`);

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
 * Generates a complete MCP server from the configuration
 */
export function generateMCPServer(config: MCPServerConfig): string {
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
  if ((config.resources || []).length > 0) capabilities.push('resources: {}');
  if ((config.prompts || []).length > 0) capabilities.push('prompts: {}');
  const capabilitiesStr = capabilities.join(',\n      ');

  return `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

/**
 * ${config.name}
 * Version: ${config.version}
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

// ============================================================================
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
});
`;
}
