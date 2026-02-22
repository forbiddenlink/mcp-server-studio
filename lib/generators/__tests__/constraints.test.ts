import { describe, it, expect } from 'vitest';
import { MCPParameter, MCPServerConfig, MCPTool } from '../../types';
import { generateMCPServer } from '../mcpServerGenerator';
import { generateManifest } from '../manifestGenerator';
import { generateReadme } from '../readmeGenerator';
import { validateParameters } from '../../simulators/mcpTestSimulator';
import { createExportBundle } from '../exportBundler';

const baseConfig: MCPServerConfig = {
  name: 'test-server',
  version: '1.0.0',
  transport: 'stdio',
  httpPort: 3000,
  tools: [],
  resources: [],
  prompts: [],
};

function createToolWithParams(params: MCPParameter[]): MCPServerConfig {
  const tool: MCPTool = {
    id: '1',
    name: 'test_tool',
    description: 'Test tool',
    icon: '🔧',
    parameters: params,
  };
  return { ...baseConfig, tools: [tool] };
}

describe('Parameter Constraints', () => {
  describe('Zod Schema Generation', () => {
    it('generates z.enum() for string with enum', () => {
      const config = createToolWithParams([{
        name: 'status',
        type: 'string',
        description: 'Status',
        required: true,
        enum: ['pending', 'active', 'completed'],
      }]);
      const code = generateMCPServer(config);
      expect(code).toContain('z.enum');
      expect(code).toContain('pending');
    });

    it('generates .email() for email format', () => {
      const config = createToolWithParams([{
        name: 'email',
        type: 'string',
        description: 'Email',
        required: true,
        format: 'email',
      }]);
      const code = generateMCPServer(config);
      expect(code).toContain('.email()');
    });

    it('generates .url() for uri format', () => {
      const config = createToolWithParams([{
        name: 'website',
        type: 'string',
        description: 'Website',
        required: true,
        format: 'uri',
      }]);
      const code = generateMCPServer(config);
      expect(code).toContain('.url()');
    });

    it('generates .uuid() for uuid format', () => {
      const config = createToolWithParams([{
        name: 'id',
        type: 'string',
        description: 'ID',
        required: true,
        format: 'uuid',
      }]);
      const code = generateMCPServer(config);
      expect(code).toContain('.uuid()');
    });

    it('generates .min().max() for number bounds', () => {
      const config = createToolWithParams([{
        name: 'count',
        type: 'number',
        description: 'Count',
        required: true,
        minimum: 1,
        maximum: 100,
      }]);
      const code = generateMCPServer(config);
      expect(code).toContain('.min(1)');
      expect(code).toContain('.max(100)');
    });

    it('generates .min().max() for string length', () => {
      const config = createToolWithParams([{
        name: 'name',
        type: 'string',
        description: 'Name',
        required: true,
        minLength: 2,
        maxLength: 50,
      }]);
      const code = generateMCPServer(config);
      expect(code).toContain('.min(2)');
      expect(code).toContain('.max(50)');
    });

    it('generates .regex() for pattern', () => {
      const config = createToolWithParams([{
        name: 'code',
        type: 'string',
        description: 'Code',
        required: true,
        pattern: '^[A-Z]{3}$',
      }]);
      const code = generateMCPServer(config);
      expect(code).toContain('.regex');
      expect(code).toContain('[A-Z]{3}');
    });

    it('generates array constraints', () => {
      const config = createToolWithParams([{
        name: 'items',
        type: 'array',
        description: 'Items',
        required: true,
        minItems: 1,
        maxItems: 10,
        uniqueItems: true,
      }]);
      const code = generateMCPServer(config);
      expect(code).toContain('.min(1)');
      expect(code).toContain('.max(10)');
      expect(code).toContain('unique');
    });

    it('generates .default() for default values', () => {
      const config = createToolWithParams([{
        name: 'count',
        type: 'number',
        description: 'Count',
        required: false,
        default: 10,
      }]);
      const code = generateMCPServer(config);
      expect(code).toContain('.default(10)');
    });
  });

  describe('JSON Schema Generation', () => {
    it('includes enum in JSON Schema', () => {
      const config = createToolWithParams([{
        name: 'status',
        type: 'string',
        description: 'Status',
        required: true,
        enum: ['a', 'b'],
      }]);
      const manifest = JSON.stringify(generateManifest(config));
      expect(manifest).toContain('"enum"');
    });

    it('includes format in JSON Schema', () => {
      const config = createToolWithParams([{
        name: 'email',
        type: 'string',
        description: 'Email',
        required: true,
        format: 'email',
      }]);
      const manifest = JSON.stringify(generateManifest(config));
      expect(manifest).toContain('"format"');
      expect(manifest).toContain('"email"');
    });

    it('includes number bounds in JSON Schema', () => {
      const config = createToolWithParams([{
        name: 'count',
        type: 'number',
        description: 'Count',
        required: true,
        minimum: 5,
        maximum: 50,
      }]);
      const manifest = JSON.stringify(generateManifest(config));
      expect(manifest).toContain('"minimum"');
      expect(manifest).toContain('"maximum"');
    });

    it('includes string length in JSON Schema', () => {
      const config = createToolWithParams([{
        name: 'name',
        type: 'string',
        description: 'Name',
        required: true,
        minLength: 1,
        maxLength: 100,
      }]);
      const manifest = JSON.stringify(generateManifest(config));
      expect(manifest).toContain('"minLength"');
      expect(manifest).toContain('"maxLength"');
    });

    it('includes pattern in JSON Schema', () => {
      const config = createToolWithParams([{
        name: 'code',
        type: 'string',
        description: 'Code',
        required: true,
        pattern: '^[A-Z]+$',
      }]);
      const manifest = JSON.stringify(generateManifest(config));
      expect(manifest).toContain('"pattern"');
    });

    it('includes array constraints in JSON Schema', () => {
      const config = createToolWithParams([{
        name: 'items',
        type: 'array',
        description: 'Items',
        required: true,
        minItems: 1,
        maxItems: 5,
        uniqueItems: true,
      }]);
      const manifest = JSON.stringify(generateManifest(config));
      expect(manifest).toContain('"minItems"');
      expect(manifest).toContain('"maxItems"');
      expect(manifest).toContain('"uniqueItems"');
    });

    it('includes default in JSON Schema', () => {
      const config = createToolWithParams([{
        name: 'count',
        type: 'number',
        description: 'Count',
        required: false,
        default: 42,
      }]);
      const manifest = JSON.stringify(generateManifest(config));
      expect(manifest).toContain('"default"');
      expect(manifest).toContain('42');
    });
  });

  describe('Runtime Validation', () => {
    it('rejects invalid enum value', () => {
      const params: MCPParameter[] = [{
        name: 'status',
        type: 'string',
        description: 'Status',
        required: true,
        enum: ['active', 'inactive'],
      }];
      const errors = validateParameters({ status: 'invalid' }, params);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('must be one of');
    });

    it('rejects invalid email format', () => {
      const params: MCPParameter[] = [{
        name: 'email',
        type: 'string',
        description: 'Email',
        required: true,
        format: 'email',
      }];
      const errors = validateParameters({ email: 'not-an-email' }, params);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('valid email');
    });

    it('rejects number below minimum', () => {
      const params: MCPParameter[] = [{
        name: 'count',
        type: 'number',
        description: 'Count',
        required: true,
        minimum: 10,
      }];
      const errors = validateParameters({ count: 5 }, params);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('at least 10');
    });

    it('rejects number above maximum', () => {
      const params: MCPParameter[] = [{
        name: 'count',
        type: 'number',
        description: 'Count',
        required: true,
        maximum: 100,
      }];
      const errors = validateParameters({ count: 150 }, params);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('at most 100');
    });

    it('rejects string below minLength', () => {
      const params: MCPParameter[] = [{
        name: 'name',
        type: 'string',
        description: 'Name',
        required: true,
        minLength: 5,
      }];
      const errors = validateParameters({ name: 'ab' }, params);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('at least 5 characters');
    });

    it('rejects string above maxLength', () => {
      const params: MCPParameter[] = [{
        name: 'name',
        type: 'string',
        description: 'Name',
        required: true,
        maxLength: 5,
      }];
      const errors = validateParameters({ name: 'toolongname' }, params);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('at most 5 characters');
    });

    it('rejects string not matching pattern', () => {
      const params: MCPParameter[] = [{
        name: 'code',
        type: 'string',
        description: 'Code',
        required: true,
        pattern: '^[A-Z]{3}$',
      }];
      const errors = validateParameters({ code: 'abc' }, params);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('must match pattern');
    });

    it('rejects array below minItems', () => {
      const params: MCPParameter[] = [{
        name: 'items',
        type: 'array',
        description: 'Items',
        required: true,
        minItems: 2,
      }];
      const errors = validateParameters({ items: ['one'] }, params);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('at least 2 items');
    });

    it('rejects array above maxItems', () => {
      const params: MCPParameter[] = [{
        name: 'items',
        type: 'array',
        description: 'Items',
        required: true,
        maxItems: 2,
      }];
      const errors = validateParameters({ items: ['a', 'b', 'c'] }, params);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('at most 2 items');
    });

    it('rejects array with duplicate items when uniqueItems is true', () => {
      const params: MCPParameter[] = [{
        name: 'items',
        type: 'array',
        description: 'Items',
        required: true,
        uniqueItems: true,
      }];
      const errors = validateParameters({ items: ['a', 'b', 'a'] }, params);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('unique');
    });

    it('accepts valid values', () => {
      const params: MCPParameter[] = [{
        name: 'email',
        type: 'string',
        description: 'Email',
        required: true,
        format: 'email',
      }];
      const errors = validateParameters({ email: 'test@example.com' }, params);
      expect(errors.length).toBe(0);
    });
  });

  describe('README Generation', () => {
    it('documents enum values', () => {
      const config = createToolWithParams([{
        name: 'status',
        type: 'string',
        description: 'Status',
        required: true,
        enum: ['active', 'inactive'],
      }]);
      const readme = generateReadme(config);
      expect(readme).toContain('Allowed values');
    });

    it('documents format', () => {
      const config = createToolWithParams([{
        name: 'email',
        type: 'string',
        description: 'Email',
        required: true,
        format: 'email',
      }]);
      const readme = generateReadme(config);
      expect(readme).toContain('Format: email');
    });

    it('documents number range', () => {
      const config = createToolWithParams([{
        name: 'count',
        type: 'number',
        description: 'Count',
        required: true,
        minimum: 1,
        maximum: 100,
      }]);
      const readme = generateReadme(config);
      expect(readme).toMatch(/Range:|1-100/);
    });

    it('documents string length', () => {
      const config = createToolWithParams([{
        name: 'name',
        type: 'string',
        description: 'Name',
        required: true,
        minLength: 1,
        maxLength: 50,
      }]);
      const readme = generateReadme(config);
      expect(readme).toMatch(/Length:|Min length|Max length/);
    });

    it('documents default value', () => {
      const config = createToolWithParams([{
        name: 'count',
        type: 'number',
        description: 'Count',
        required: false,
        default: 10,
      }]);
      const readme = generateReadme(config);
      expect(readme).toContain('Default');
    });
  });

  describe('Export Bundle', () => {
    it('includes claude_desktop_config.json in Docker export', () => {
      const bundle = createExportBundle(baseConfig, 'docker');
      const configFile = bundle.files.find(f => f.name === 'claude_desktop_config.json');
      expect(configFile).toBeDefined();
      expect(configFile!.content).toContain('mcpServers');
    });

    it('includes claude_desktop_config.json in Railway export', () => {
      const bundle = createExportBundle(baseConfig, 'railway');
      const configFile = bundle.files.find(f => f.name === 'claude_desktop_config.json');
      expect(configFile).toBeDefined();
    });
  });
});
