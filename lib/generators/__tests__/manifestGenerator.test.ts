import { describe, it, expect } from 'vitest';
import { generateManifest } from '../manifestGenerator';
import { MCPServerConfig } from '../../types';

describe('manifestGenerator', () => {
  describe('generateManifest', () => {
    it('generates basic manifest structure with name and version', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);

      expect(manifest.name).toBe('test-server');
      expect(manifest.version).toBe('1.0.0');
    });

    it('sets capabilities based on tool/resource/prompt presence', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Test Tool',
            description: 'A test tool',
            icon: 'Wrench',
            parameters: [],
          },
        ],
        resources: [
          {
            id: 'resource-1',
            name: 'Test Resource',
            description: 'A test resource',
            uri: 'file://test.txt',
            mimeType: 'text/plain',
          },
        ],
        prompts: [
          {
            id: 'prompt-1',
            name: 'Test Prompt',
            description: 'A test prompt',
            arguments: [],
          },
        ],
      };

      const manifest = generateManifest(config);
      const capabilities = manifest.capabilities as Record<string, boolean>;

      expect(capabilities.tools).toBe(true);
      expect(capabilities.resources).toBe(true);
      expect(capabilities.prompts).toBe(true);
    });

    it('sets capabilities to false when collections are empty', () => {
      const config: MCPServerConfig = {
        name: 'empty-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const capabilities = manifest.capabilities as Record<string, boolean>;

      expect(capabilities.tools).toBe(false);
      expect(capabilities.resources).toBe(false);
      expect(capabilities.prompts).toBe(false);
    });

    it('sets sampling capability when any tool has sampling enabled', () => {
      const config: MCPServerConfig = {
        name: 'sampling-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Sampling Tool',
            description: 'Tool with sampling',
            icon: 'Wrench',
            parameters: [],
            sampling: {
              enabled: true,
              maxTokens: 1000,
            },
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const capabilities = manifest.capabilities as Record<string, boolean>;

      expect(capabilities.sampling).toBe(true);
    });

    it('sets elicitation capability when any tool has elicitation enabled', () => {
      const config: MCPServerConfig = {
        name: 'elicitation-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Elicitation Tool',
            description: 'Tool with elicitation',
            icon: 'Wrench',
            parameters: [],
            elicitation: {
              enabled: true,
              mode: 'form',
              message: 'Please provide input',
            },
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const capabilities = manifest.capabilities as Record<string, boolean>;

      expect(capabilities.elicitation).toBe(true);
    });
  });

  describe('tool manifest generation', () => {
    it('sanitizes tool names to snake_case', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'My Test Tool',
            description: 'A test tool',
            icon: 'Wrench',
            parameters: [],
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;

      expect(tools[0].name).toBe('my_test_tool');
    });

    it('removes special characters from tool names', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Tool@#$%With!Symbols',
            description: 'A test tool',
            icon: 'Wrench',
            parameters: [],
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;

      expect(tools[0].name).toBe('toolwithsymbols');
    });

    it('includes description and icon in tool manifest', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Test Tool',
            description: 'A descriptive test tool',
            icon: 'Wrench',
            parameters: [],
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;

      expect(tools[0].description).toBe('A descriptive test tool');
      expect(tools[0].icon).toBe('Wrench');
    });

    it('marks tool as using sampling when enabled', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Sampling Tool',
            description: 'Tool with sampling',
            icon: 'Wrench',
            parameters: [],
            sampling: {
              enabled: true,
              maxTokens: 500,
            },
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;

      expect(tools[0].usesSampling).toBe(true);
    });

    it('marks tool as using elicitation when enabled', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Elicitation Tool',
            description: 'Tool with elicitation',
            icon: 'Wrench',
            parameters: [],
            elicitation: {
              enabled: true,
              mode: 'url',
              message: 'Visit this URL',
              url: 'https://example.com',
            },
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;

      expect(tools[0].usesElicitation).toBe(true);
    });

    it('marks tool as long running when tasks enabled', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Long Running Tool',
            description: 'Tool with tasks',
            icon: 'Wrench',
            parameters: [],
            tasks: {
              enabled: true,
              ttl: 60000,
            },
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;

      expect(tools[0].isLongRunning).toBe(true);
    });
  });

  describe('JSON Schema generation', () => {
    it('generates basic object schema structure', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Test Tool',
            description: 'Test',
            icon: 'Wrench',
            parameters: [],
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;
      const inputSchema = tools[0].inputSchema as Record<string, unknown>;

      expect(inputSchema.type).toBe('object');
      expect(inputSchema.properties).toEqual({});
      expect(inputSchema.required).toEqual([]);
    });

    it('generates parameter with basic properties', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Test Tool',
            description: 'Test',
            icon: 'Wrench',
            parameters: [
              {
                name: 'query',
                type: 'string',
                description: 'Search query',
                required: true,
              },
            ],
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;
      const inputSchema = tools[0].inputSchema as Record<string, unknown>;
      const properties = inputSchema.properties as Record<string, Record<string, unknown>>;

      expect(properties.query.type).toBe('string');
      expect(properties.query.description).toBe('Search query');
      expect(inputSchema.required).toContain('query');
    });

    it('handles optional parameters correctly', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Test Tool',
            description: 'Test',
            icon: 'Wrench',
            parameters: [
              {
                name: 'optional_param',
                type: 'string',
                description: 'An optional parameter',
                required: false,
              },
            ],
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;
      const inputSchema = tools[0].inputSchema as Record<string, unknown>;

      expect(inputSchema.required).not.toContain('optional_param');
    });

    it('includes enum constraint in schema', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Test Tool',
            description: 'Test',
            icon: 'Wrench',
            parameters: [
              {
                name: 'status',
                type: 'string',
                description: 'Status value',
                required: true,
                enum: ['active', 'inactive', 'pending'],
              },
            ],
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;
      const inputSchema = tools[0].inputSchema as Record<string, unknown>;
      const properties = inputSchema.properties as Record<string, Record<string, unknown>>;

      expect(properties.status.enum).toEqual(['active', 'inactive', 'pending']);
    });

    it('includes format constraint in schema', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Test Tool',
            description: 'Test',
            icon: 'Wrench',
            parameters: [
              {
                name: 'email',
                type: 'string',
                description: 'Email address',
                required: true,
                format: 'email',
              },
            ],
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;
      const inputSchema = tools[0].inputSchema as Record<string, unknown>;
      const properties = inputSchema.properties as Record<string, Record<string, unknown>>;

      expect(properties.email.format).toBe('email');
    });

    it('includes string length constraints', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Test Tool',
            description: 'Test',
            icon: 'Wrench',
            parameters: [
              {
                name: 'username',
                type: 'string',
                description: 'Username',
                required: true,
                minLength: 3,
                maxLength: 20,
              },
            ],
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;
      const inputSchema = tools[0].inputSchema as Record<string, unknown>;
      const properties = inputSchema.properties as Record<string, Record<string, unknown>>;

      expect(properties.username.minLength).toBe(3);
      expect(properties.username.maxLength).toBe(20);
    });

    it('includes pattern constraint', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Test Tool',
            description: 'Test',
            icon: 'Wrench',
            parameters: [
              {
                name: 'phone',
                type: 'string',
                description: 'Phone number',
                required: true,
                pattern: '^\\d{3}-\\d{3}-\\d{4}$',
              },
            ],
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;
      const inputSchema = tools[0].inputSchema as Record<string, unknown>;
      const properties = inputSchema.properties as Record<string, Record<string, unknown>>;

      expect(properties.phone.pattern).toBe('^\\d{3}-\\d{3}-\\d{4}$');
    });

    it('includes number range constraints', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Test Tool',
            description: 'Test',
            icon: 'Wrench',
            parameters: [
              {
                name: 'age',
                type: 'number',
                description: 'Age in years',
                required: true,
                minimum: 0,
                maximum: 150,
              },
            ],
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;
      const inputSchema = tools[0].inputSchema as Record<string, unknown>;
      const properties = inputSchema.properties as Record<string, Record<string, unknown>>;

      expect(properties.age.minimum).toBe(0);
      expect(properties.age.maximum).toBe(150);
    });

    it('includes array constraints', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Test Tool',
            description: 'Test',
            icon: 'Wrench',
            parameters: [
              {
                name: 'tags',
                type: 'array',
                description: 'List of tags',
                required: true,
                minItems: 1,
                maxItems: 10,
                uniqueItems: true,
              },
            ],
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;
      const inputSchema = tools[0].inputSchema as Record<string, unknown>;
      const properties = inputSchema.properties as Record<string, Record<string, unknown>>;

      expect(properties.tags.minItems).toBe(1);
      expect(properties.tags.maxItems).toBe(10);
      expect(properties.tags.uniqueItems).toBe(true);
    });

    it('includes default value in schema', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Test Tool',
            description: 'Test',
            icon: 'Wrench',
            parameters: [
              {
                name: 'limit',
                type: 'number',
                description: 'Result limit',
                required: false,
                default: 10,
              },
            ],
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;
      const inputSchema = tools[0].inputSchema as Record<string, unknown>;
      const properties = inputSchema.properties as Record<string, Record<string, unknown>>;

      expect(properties.limit.default).toBe(10);
    });

    it('does not include empty enum array', () => {
      const config: MCPServerConfig = {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'tool-1',
            name: 'Test Tool',
            description: 'Test',
            icon: 'Wrench',
            parameters: [
              {
                name: 'value',
                type: 'string',
                description: 'A value',
                required: true,
                enum: [],
              },
            ],
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;
      const inputSchema = tools[0].inputSchema as Record<string, unknown>;
      const properties = inputSchema.properties as Record<string, Record<string, unknown>>;

      expect(properties.value.enum).toBeUndefined();
    });

    it('handles multiple tools with multiple parameters', () => {
      const config: MCPServerConfig = {
        name: 'multi-tool-server',
        version: '2.0.0',
        transport: 'http',
        httpPort: 8080,
        tools: [
          {
            id: 'tool-1',
            name: 'Search',
            description: 'Search for items',
            icon: 'Search',
            parameters: [
              {
                name: 'query',
                type: 'string',
                description: 'Search query',
                required: true,
              },
              {
                name: 'limit',
                type: 'number',
                description: 'Max results',
                required: false,
                default: 10,
                minimum: 1,
                maximum: 100,
              },
            ],
          },
          {
            id: 'tool-2',
            name: 'Create Item',
            description: 'Create a new item',
            icon: 'Plus',
            parameters: [
              {
                name: 'name',
                type: 'string',
                description: 'Item name',
                required: true,
                minLength: 1,
                maxLength: 100,
              },
              {
                name: 'tags',
                type: 'array',
                description: 'Item tags',
                required: false,
                uniqueItems: true,
              },
            ],
          },
        ],
        resources: [],
        prompts: [],
      };

      const manifest = generateManifest(config);
      const tools = manifest.tools as Array<Record<string, unknown>>;

      expect(tools).toHaveLength(2);
      expect(tools[0].name).toBe('search');
      expect(tools[1].name).toBe('create_item');

      const searchSchema = tools[0].inputSchema as Record<string, unknown>;
      expect((searchSchema.properties as Record<string, unknown>).query).toBeDefined();
      expect((searchSchema.properties as Record<string, unknown>).limit).toBeDefined();

      const createSchema = tools[1].inputSchema as Record<string, unknown>;
      expect((createSchema.properties as Record<string, unknown>).name).toBeDefined();
      expect((createSchema.properties as Record<string, unknown>).tags).toBeDefined();
    });
  });
});
