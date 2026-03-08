import { describe, it, expect } from 'vitest';
import {
  generateReadme,
  generatePackageJson,
  generateTsConfig,
  generateClaudeDesktopConfig,
  generateProjectFiles,
} from '../readmeGenerator';
import { MCPServerConfig } from '../../types';

describe('readmeGenerator', () => {
  const basicConfig: MCPServerConfig = {
    name: 'test-mcp-server',
    version: '1.0.0',
    transport: 'stdio',
    httpPort: 3000,
    tools: [],
    resources: [],
    prompts: [],
  };

  describe('generateReadme', () => {
    it('includes server name as heading', () => {
      const readme = generateReadme(basicConfig);
      expect(readme).toContain('# test-mcp-server');
    });

    it('includes version in subheading', () => {
      const readme = generateReadme(basicConfig);
      expect(readme).toContain('v1.0.0');
    });

    it('includes transport type', () => {
      const readme = generateReadme(basicConfig);
      expect(readme).toContain('Transport: stdio');
    });

    it('includes installation instructions', () => {
      const readme = generateReadme(basicConfig);
      expect(readme).toContain('npm install');
      expect(readme).toContain('npm run build');
    });

    it('includes MCP Server Studio attribution', () => {
      const readme = generateReadme(basicConfig);
      expect(readme).toContain('MCP Server Studio');
    });

    it('includes tool documentation when tools exist', () => {
      const configWithTools: MCPServerConfig = {
        ...basicConfig,
        tools: [
          {
            id: 'tool-1',
            name: 'Search Tool',
            description: 'Search for items',
            icon: '🔍',
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
      };

      const readme = generateReadme(configWithTools);
      expect(readme).toContain('## Available Tools');
      expect(readme).toContain('🔍 Search Tool');
      expect(readme).toContain('Search for items');
      expect(readme).toContain('search_tool');
      expect(readme).toContain('`query`');
      expect(readme).toContain('**required**');
    });

    it('includes resource documentation when resources exist', () => {
      const configWithResources: MCPServerConfig = {
        ...basicConfig,
        resources: [
          {
            id: 'resource-1',
            name: 'Config File',
            description: 'Application configuration',
            uri: 'file://config.json',
            mimeType: 'application/json',
          },
        ],
      };

      const readme = generateReadme(configWithResources);
      expect(readme).toContain('## Available Resources');
      expect(readme).toContain('Config File');
      expect(readme).toContain('file://config.json');
      expect(readme).toContain('application/json');
    });

    it('includes prompt documentation when prompts exist', () => {
      const configWithPrompts: MCPServerConfig = {
        ...basicConfig,
        prompts: [
          {
            id: 'prompt-1',
            name: 'Greeting Prompt',
            description: 'Generate a greeting',
            arguments: [
              {
                name: 'name',
                type: 'string',
                description: 'Person name',
                required: true,
              },
            ],
          },
        ],
      };

      const readme = generateReadme(configWithPrompts);
      expect(readme).toContain('## Available Prompts');
      expect(readme).toContain('Greeting Prompt');
      expect(readme).toContain('greeting_prompt');
    });

    it('generates HTTP transport configuration', () => {
      const httpConfig: MCPServerConfig = {
        ...basicConfig,
        transport: 'http',
        httpPort: 8080,
      };

      const readme = generateReadme(httpConfig);
      expect(readme).toContain('Transport: http');
      expect(readme).toContain('HTTP/SSE transport');
      expect(readme).toContain('port 8080');
      expect(readme).toContain('/sse');
      expect(readme).toContain('/health');
    });

    it('includes Docker documentation', () => {
      const readme = generateReadme(basicConfig);
      expect(readme).toContain('## Docker');
      expect(readme).toContain('docker build');
      expect(readme).toContain('docker run');
    });

    it('includes Railway deployment button', () => {
      const readme = generateReadme(basicConfig);
      expect(readme).toContain('Railway');
      expect(readme).toContain('railway.app');
    });

    it('documents parameter constraints', () => {
      const configWithConstraints: MCPServerConfig = {
        ...basicConfig,
        tools: [
          {
            id: 'tool-1',
            name: 'Constrained Tool',
            description: 'Tool with constraints',
            icon: 'Wrench',
            parameters: [
              {
                name: 'email',
                type: 'string',
                description: 'Email address',
                required: true,
                format: 'email',
              },
              {
                name: 'count',
                type: 'number',
                description: 'Count',
                required: true,
                minimum: 1,
                maximum: 100,
              },
              {
                name: 'status',
                type: 'string',
                description: 'Status',
                required: true,
                enum: ['active', 'inactive'],
              },
              {
                name: 'username',
                type: 'string',
                description: 'Username',
                required: true,
                minLength: 3,
                maxLength: 20,
              },
              {
                name: 'tags',
                type: 'array',
                description: 'Tags',
                required: false,
                minItems: 1,
                maxItems: 5,
                uniqueItems: true,
              },
              {
                name: 'pattern_field',
                type: 'string',
                description: 'Pattern field',
                required: true,
                pattern: '^[A-Z]+$',
              },
              {
                name: 'with_default',
                type: 'number',
                description: 'Has default',
                required: false,
                default: 10,
              },
            ],
          },
        ],
      };

      const readme = generateReadme(configWithConstraints);
      expect(readme).toContain('Format: email');
      expect(readme).toContain('Range: 1-100');
      expect(readme).toContain('`active`');
      expect(readme).toContain('`inactive`');
      expect(readme).toContain('Length: 3-20');
      expect(readme).toContain('Items: 1-5');
      expect(readme).toContain('Unique items required');
      expect(readme).toContain('Pattern:');
      expect(readme).toContain('Default: `10`');
    });

    it('shows *No parameters* for tools without parameters', () => {
      const configNoParams: MCPServerConfig = {
        ...basicConfig,
        tools: [
          {
            id: 'tool-1',
            name: 'No Params Tool',
            description: 'A tool without parameters',
            icon: 'Wrench',
            parameters: [],
          },
        ],
      };

      const readme = generateReadme(configNoParams);
      expect(readme).toContain('*No parameters*');
    });
  });

  describe('generatePackageJson', () => {
    it('generates valid JSON structure', () => {
      const packageJson = generatePackageJson(basicConfig);
      const parsed = JSON.parse(packageJson);
      expect(parsed).toBeDefined();
    });

    it('includes server name and version', () => {
      const packageJson = generatePackageJson(basicConfig);
      const parsed = JSON.parse(packageJson);
      expect(parsed.name).toBe('test-mcp-server');
      expect(parsed.version).toBe('1.0.0');
    });

    it('sets module type to ESM', () => {
      const packageJson = generatePackageJson(basicConfig);
      const parsed = JSON.parse(packageJson);
      expect(parsed.type).toBe('module');
    });

    it('includes required scripts', () => {
      const packageJson = generatePackageJson(basicConfig);
      const parsed = JSON.parse(packageJson);
      expect(parsed.scripts.build).toBeDefined();
      expect(parsed.scripts.start).toBeDefined();
      expect(parsed.scripts.dev).toBeDefined();
      expect(parsed.scripts.lint).toBeDefined();
    });

    it('includes MCP SDK dependency', () => {
      const packageJson = generatePackageJson(basicConfig);
      const parsed = JSON.parse(packageJson);
      expect(parsed.dependencies['@modelcontextprotocol/sdk']).toBeDefined();
    });

    it('includes Zod dependency', () => {
      const packageJson = generatePackageJson(basicConfig);
      const parsed = JSON.parse(packageJson);
      expect(parsed.dependencies['zod']).toBeDefined();
    });

    it('includes TypeScript dev dependencies', () => {
      const packageJson = generatePackageJson(basicConfig);
      const parsed = JSON.parse(packageJson);
      expect(parsed.devDependencies['typescript']).toBeDefined();
      expect(parsed.devDependencies['@types/node']).toBeDefined();
      expect(parsed.devDependencies['tsx']).toBeDefined();
    });

    it('adds Express dependencies for HTTP transport', () => {
      const httpConfig: MCPServerConfig = {
        ...basicConfig,
        transport: 'http',
      };

      const packageJson = generatePackageJson(httpConfig);
      const parsed = JSON.parse(packageJson);
      expect(parsed.dependencies['express']).toBeDefined();
      expect(parsed.dependencies['cors']).toBeDefined();
      expect(parsed.devDependencies['@types/express']).toBeDefined();
      expect(parsed.devDependencies['@types/cors']).toBeDefined();
    });

    it('does not include Express for stdio transport', () => {
      const packageJson = generatePackageJson(basicConfig);
      const parsed = JSON.parse(packageJson);
      expect(parsed.dependencies['express']).toBeUndefined();
      expect(parsed.dependencies['cors']).toBeUndefined();
    });

    it('includes bin entry for CLI usage', () => {
      const packageJson = generatePackageJson(basicConfig);
      const parsed = JSON.parse(packageJson);
      expect(parsed.bin['test-mcp-server']).toBe('./build/index.js');
    });

    it('sets minimum Node version', () => {
      const packageJson = generatePackageJson(basicConfig);
      const parsed = JSON.parse(packageJson);
      expect(parsed.engines.node).toBe('>=18.0.0');
    });

    it('includes relevant keywords', () => {
      const packageJson = generatePackageJson(basicConfig);
      const parsed = JSON.parse(packageJson);
      expect(parsed.keywords).toContain('mcp');
      expect(parsed.keywords).toContain('model-context-protocol');
    });
  });

  describe('generateTsConfig', () => {
    it('generates valid JSON', () => {
      const tsconfig = generateTsConfig();
      const parsed = JSON.parse(tsconfig);
      expect(parsed).toBeDefined();
    });

    it('targets ES2022', () => {
      const tsconfig = generateTsConfig();
      const parsed = JSON.parse(tsconfig);
      expect(parsed.compilerOptions.target).toBe('ES2022');
    });

    it('uses NodeNext module resolution', () => {
      const tsconfig = generateTsConfig();
      const parsed = JSON.parse(tsconfig);
      expect(parsed.compilerOptions.module).toBe('NodeNext');
      expect(parsed.compilerOptions.moduleResolution).toBe('NodeNext');
    });

    it('enables strict mode', () => {
      const tsconfig = generateTsConfig();
      const parsed = JSON.parse(tsconfig);
      expect(parsed.compilerOptions.strict).toBe(true);
    });

    it('sets output directory to build', () => {
      const tsconfig = generateTsConfig();
      const parsed = JSON.parse(tsconfig);
      expect(parsed.compilerOptions.outDir).toBe('./build');
    });

    it('sets root directory to src', () => {
      const tsconfig = generateTsConfig();
      const parsed = JSON.parse(tsconfig);
      expect(parsed.compilerOptions.rootDir).toBe('./src');
    });

    it('generates declarations and source maps', () => {
      const tsconfig = generateTsConfig();
      const parsed = JSON.parse(tsconfig);
      expect(parsed.compilerOptions.declaration).toBe(true);
      expect(parsed.compilerOptions.declarationMap).toBe(true);
      expect(parsed.compilerOptions.sourceMap).toBe(true);
    });

    it('excludes node_modules and build', () => {
      const tsconfig = generateTsConfig();
      const parsed = JSON.parse(tsconfig);
      expect(parsed.exclude).toContain('node_modules');
      expect(parsed.exclude).toContain('build');
    });
  });

  describe('generateClaudeDesktopConfig', () => {
    it('generates valid JSON', () => {
      const config = generateClaudeDesktopConfig(basicConfig);
      const parsed = JSON.parse(config);
      expect(parsed).toBeDefined();
    });

    it('wraps config in mcpServers object', () => {
      const config = generateClaudeDesktopConfig(basicConfig);
      const parsed = JSON.parse(config);
      expect(parsed.mcpServers).toBeDefined();
    });

    it('uses server name as key', () => {
      const config = generateClaudeDesktopConfig(basicConfig);
      const parsed = JSON.parse(config);
      expect(parsed.mcpServers['test-mcp-server']).toBeDefined();
    });

    it('sets node as command', () => {
      const config = generateClaudeDesktopConfig(basicConfig);
      const parsed = JSON.parse(config);
      expect(parsed.mcpServers['test-mcp-server'].command).toBe('node');
    });

    it('points to build output', () => {
      const config = generateClaudeDesktopConfig(basicConfig);
      const parsed = JSON.parse(config);
      expect(parsed.mcpServers['test-mcp-server'].args).toContain('./build/index.js');
    });
  });

  describe('generateProjectFiles', () => {
    it('returns all project files', () => {
      const files = generateProjectFiles(basicConfig);
      expect(files['README.md']).toBeDefined();
      expect(files['package.json']).toBeDefined();
      expect(files['tsconfig.json']).toBeDefined();
      expect(files['claude_desktop_config.json']).toBeDefined();
    });

    it('returns 4 files total', () => {
      const files = generateProjectFiles(basicConfig);
      expect(Object.keys(files)).toHaveLength(4);
    });

    it('all files are non-empty strings', () => {
      const files = generateProjectFiles(basicConfig);
      for (const [, content] of Object.entries(files)) {
        expect(typeof content).toBe('string');
        expect(content.length).toBeGreaterThan(0);
      }
    });
  });
});
