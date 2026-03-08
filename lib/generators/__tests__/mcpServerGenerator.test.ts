import { describe, it, expect } from 'vitest';
import { generateMCPServer } from '../mcpServerGenerator';
import { MCPServerConfig, MCPTool, MCPResource, MCPPrompt } from '../../types';

const baseConfig: MCPServerConfig = {
  name: 'test-server',
  version: '1.0.0',
  transport: 'stdio',
  httpPort: 3000,
  tools: [],
  resources: [],
  prompts: [],
};

const sampleTool: MCPTool = {
  id: 'tool-1',
  name: 'search users',
  description: 'Search for users by query',
  icon: 'Search',
  parameters: [
    { name: 'query', type: 'string', description: 'Search query', required: true },
    { name: 'limit', type: 'number', description: 'Max results', required: false, default: 10 },
  ],
};

const sampleResource: MCPResource = {
  id: 'resource-1',
  name: 'user_schema',
  description: 'User database schema',
  uri: 'db://users/schema',
  mimeType: 'application/json',
};

const samplePrompt: MCPPrompt = {
  id: 'prompt-1',
  name: 'code review',
  description: 'Review code for issues',
  arguments: [
    { name: 'code', type: 'string', description: 'Code to review', required: true },
    { name: 'language', type: 'string', description: 'Language', required: false },
  ],
};

describe('mcpServerGenerator', () => {
  describe('stdio transport', () => {
    it('generates imports for stdio', () => {
      const code = generateMCPServer(baseConfig);
      expect(code).toContain('StdioServerTransport');
      expect(code).not.toContain('express');
    });

    it('generates server initialization', () => {
      const code = generateMCPServer(baseConfig);
      expect(code).toContain('new McpServer');
      expect(code).toContain('"test-server"');
      expect(code).toContain('"1.0.0"');
    });

    it('generates main() with stdio transport', () => {
      const code = generateMCPServer(baseConfig);
      expect(code).toContain('new StdioServerTransport()');
      expect(code).toContain('server.connect(transport)');
    });
  });

  describe('HTTP transport', () => {
    it('generates imports for HTTP/SSE', () => {
      const config = { ...baseConfig, transport: 'http' as const };
      const code = generateMCPServer(config);
      expect(code).toContain('SSEServerTransport');
      expect(code).toContain('express');
      expect(code).toContain('cors');
    });

    it('generates health check endpoint', () => {
      const config = { ...baseConfig, transport: 'http' as const };
      const code = generateMCPServer(config);
      expect(code).toContain('/health');
      expect(code).toContain('status');
    });

    it('generates SSE and message endpoints', () => {
      const config = { ...baseConfig, transport: 'http' as const };
      const code = generateMCPServer(config);
      expect(code).toContain('/sse');
      expect(code).toContain('/messages');
    });

    it('uses configured port', () => {
      const config = { ...baseConfig, transport: 'http' as const, httpPort: 8080 };
      const code = generateMCPServer(config);
      expect(code).toContain('8080');
    });
  });

  describe('tool generation', () => {
    it('generates Zod schema for tool parameters', () => {
      const config = { ...baseConfig, tools: [sampleTool] };
      const code = generateMCPServer(config);
      expect(code).toContain('z.object');
      expect(code).toContain('z.string()');
      expect(code).toContain('z.number()');
    });

    it('generates tool registration with server.tool()', () => {
      const config = { ...baseConfig, tools: [sampleTool] };
      const code = generateMCPServer(config);
      expect(code).toContain('server.tool(');
      expect(code).toContain('"search_users"');
    });

    it('converts tool name to snake_case', () => {
      const config = { ...baseConfig, tools: [sampleTool] };
      const code = generateMCPServer(config);
      expect(code).toContain('search_users');
    });

    it('handles optional parameters with .optional()', () => {
      const config = { ...baseConfig, tools: [sampleTool] };
      const code = generateMCPServer(config);
      expect(code).toContain('.optional()');
    });

    it('generates .default() for default values', () => {
      const config = { ...baseConfig, tools: [sampleTool] };
      const code = generateMCPServer(config);
      expect(code).toContain('.default(10)');
    });

    it('includes tools capability when tools exist', () => {
      const config = { ...baseConfig, tools: [sampleTool] };
      const code = generateMCPServer(config);
      expect(code).toContain('tools: {}');
    });

    it('generates error handling in tool handler', () => {
      const config = { ...baseConfig, tools: [sampleTool] };
      const code = generateMCPServer(config);
      expect(code).toContain('catch (error)');
      expect(code).toContain('isError: true');
    });
  });

  describe('resource generation', () => {
    it('generates resource registration', () => {
      const config = { ...baseConfig, resources: [sampleResource] };
      const code = generateMCPServer(config);
      expect(code).toContain('server.resource(');
      expect(code).toContain('"user_schema"');
      expect(code).toContain('db://users/schema');
    });

    it('includes resources capability', () => {
      const config = { ...baseConfig, resources: [sampleResource] };
      const code = generateMCPServer(config);
      expect(code).toContain('resources: {}');
    });
  });

  describe('prompt generation', () => {
    it('generates prompt schema and registration', () => {
      const config = { ...baseConfig, prompts: [samplePrompt] };
      const code = generateMCPServer(config);
      expect(code).toContain('server.prompt(');
      expect(code).toContain('"code_review"');
      expect(code).toContain('PromptSchema');
    });

    it('includes prompts capability', () => {
      const config = { ...baseConfig, prompts: [samplePrompt] };
      const code = generateMCPServer(config);
      expect(code).toContain('prompts: {}');
    });
  });

  describe('sampling & elicitation', () => {
    it('generates sampling code when enabled', () => {
      const toolWithSampling: MCPTool = {
        ...sampleTool,
        sampling: {
          enabled: true,
          maxTokens: 1000,
          temperature: 0.7,
          modelHint: 'balanced',
          systemPrompt: 'You are helpful',
        },
      };
      const config = { ...baseConfig, tools: [toolWithSampling] };
      const code = generateMCPServer(config);
      expect(code).toContain('createMessage');
      expect(code).toContain('maxTokens: 1000');
      expect(code).toContain('sampling: {}');
    });

    it('generates elicitation code for form mode', () => {
      const toolWithElicit: MCPTool = {
        ...sampleTool,
        elicitation: {
          enabled: true,
          mode: 'form',
          message: 'Please confirm',
          formFields: [
            { name: 'confirm', type: 'boolean', description: 'Confirm?', required: true },
          ],
        },
      };
      const config = { ...baseConfig, tools: [toolWithElicit] };
      const code = generateMCPServer(config);
      expect(code).toContain('elicitInput');
      expect(code).toContain('form');
      expect(code).toContain('elicitation: {}');
    });

    it('generates elicitation code for URL mode', () => {
      const toolWithElicit: MCPTool = {
        ...sampleTool,
        elicitation: {
          enabled: true,
          mode: 'url',
          message: 'Visit link',
          url: 'https://example.com',
        },
      };
      const config = { ...baseConfig, tools: [toolWithElicit] };
      const code = generateMCPServer(config);
      expect(code).toContain('elicitInput');
      expect(code).toContain('url');
      expect(code).toContain('https://example.com');
    });
  });

  describe('edge cases', () => {
    it('handles empty config gracefully', () => {
      const code = generateMCPServer(baseConfig);
      expect(code).toContain('No tools defined');
    });

    it('generates valid code for config with all entity types', () => {
      const config: MCPServerConfig = {
        ...baseConfig,
        tools: [sampleTool],
        resources: [sampleResource],
        prompts: [samplePrompt],
      };
      const code = generateMCPServer(config);
      expect(code).toContain('server.tool(');
      expect(code).toContain('server.resource(');
      expect(code).toContain('server.prompt(');
    });

    it('escapes special characters in descriptions', () => {
      const tool: MCPTool = {
        ...sampleTool,
        parameters: [
          { name: 'q', type: 'string', description: 'A "quoted" value', required: true },
        ],
      };
      const config = { ...baseConfig, tools: [tool] };
      const code = generateMCPServer(config);
      expect(code).toContain('\\"quoted\\"');
    });

    it('handles tool with no parameters', () => {
      const tool: MCPTool = {
        id: 'tool-2',
        name: 'ping',
        description: 'Ping the server',
        icon: 'Globe',
        parameters: [],
      };
      const config = { ...baseConfig, tools: [tool] };
      const code = generateMCPServer(config);
      expect(code).toContain('z.object({})');
      expect(code).toContain('_args');
    });
  });
});
