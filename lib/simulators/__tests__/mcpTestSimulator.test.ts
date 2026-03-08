import { describe, it, expect } from 'vitest';
import {
  validateParameters,
  executeTool,
  testResource,
  testPrompt,
  runBatchValidation,
  simulateToolCall,
  generateChatResponse,
} from '../mcpTestSimulator';
import { MCPTool, MCPResource, MCPPrompt, MCPParameter } from '../../types';

const makeTool = (overrides: Partial<MCPTool> = {}): MCPTool => ({
  id: 'tool-1',
  name: 'test_tool',
  description: 'A test tool',
  icon: 'Search',
  parameters: [],
  ...overrides,
});

const makeResource = (overrides: Partial<MCPResource> = {}): MCPResource => ({
  id: 'resource-1',
  name: 'test_resource',
  description: 'A test resource',
  uri: 'file://test.txt',
  mimeType: 'text/plain',
  ...overrides,
});

const makePrompt = (overrides: Partial<MCPPrompt> = {}): MCPPrompt => ({
  id: 'prompt-1',
  name: 'test_prompt',
  description: 'A test prompt',
  arguments: [],
  ...overrides,
});

describe('mcpTestSimulator', () => {
  describe('validateParameters', () => {
    it('returns no errors for valid params', () => {
      const params: MCPParameter[] = [
        { name: 'name', type: 'string', description: 'Name', required: true },
      ];
      expect(validateParameters({ name: 'Alice' }, params)).toHaveLength(0);
    });

    it('returns error for missing required param', () => {
      const params: MCPParameter[] = [
        { name: 'name', type: 'string', description: 'Name', required: true },
      ];
      const errors = validateParameters({}, params);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('name');
    });

    it('treats empty string as missing for required fields', () => {
      const params: MCPParameter[] = [
        { name: 'name', type: 'string', description: 'Name', required: true },
      ];
      expect(validateParameters({ name: '' }, params)).toHaveLength(1);
    });

    it('skips validation for optional undefined values', () => {
      const params: MCPParameter[] = [
        { name: 'name', type: 'string', description: 'Name', required: false },
      ];
      expect(validateParameters({}, params)).toHaveLength(0);
    });

    it('validates string type', () => {
      const params: MCPParameter[] = [
        { name: 'val', type: 'string', description: 'V', required: true },
      ];
      const errors = validateParameters({ val: 123 }, params);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('string');
    });

    it('validates number type', () => {
      const params: MCPParameter[] = [
        { name: 'count', type: 'number', description: 'C', required: true },
      ];
      expect(validateParameters({ count: 'abc' }, params)).toHaveLength(1);
    });

    it('rejects NaN for number type', () => {
      const params: MCPParameter[] = [
        { name: 'count', type: 'number', description: 'C', required: true },
      ];
      expect(validateParameters({ count: NaN }, params)).toHaveLength(1);
    });

    it('validates boolean type', () => {
      const params: MCPParameter[] = [
        { name: 'flag', type: 'boolean', description: 'F', required: true },
      ];
      expect(validateParameters({ flag: 'yes' }, params)).toHaveLength(1);
    });

    it('validates array type', () => {
      const params: MCPParameter[] = [
        { name: 'items', type: 'array', description: 'I', required: true },
      ];
      expect(validateParameters({ items: 'not array' }, params)).toHaveLength(1);
    });

    it('validates object type', () => {
      const params: MCPParameter[] = [
        { name: 'data', type: 'object', description: 'D', required: true },
      ];
      expect(validateParameters({ data: 'not object' }, params)).toHaveLength(1);
    });

    it('rejects arrays for object type', () => {
      const params: MCPParameter[] = [
        { name: 'data', type: 'object', description: 'D', required: true },
      ];
      expect(validateParameters({ data: [1, 2] }, params)).toHaveLength(1);
    });

    it('validates uuid format', () => {
      const params: MCPParameter[] = [
        { name: 'id', type: 'string', description: 'ID', required: true, format: 'uuid' },
      ];
      expect(validateParameters({ id: 'not-a-uuid' }, params)).toHaveLength(1);
      expect(
        validateParameters({ id: '550e8400-e29b-41d4-a716-446655440000' }, params)
      ).toHaveLength(0);
    });

    it('validates date format', () => {
      const params: MCPParameter[] = [
        { name: 'd', type: 'string', description: 'D', required: true, format: 'date' },
      ];
      expect(validateParameters({ d: '2024-01-15' }, params)).toHaveLength(0);
      expect(validateParameters({ d: 'January 15' }, params)).toHaveLength(1);
    });

    it('validates date-time format', () => {
      const params: MCPParameter[] = [
        { name: 'dt', type: 'string', description: 'DT', required: true, format: 'date-time' },
      ];
      expect(
        validateParameters({ dt: '2024-01-15T10:30:00Z' }, params)
      ).toHaveLength(0);
      expect(validateParameters({ dt: '2024-01-15' }, params)).toHaveLength(1);
    });

    it('validates uri format', () => {
      const params: MCPParameter[] = [
        { name: 'url', type: 'string', description: 'U', required: true, format: 'uri' },
      ];
      expect(
        validateParameters({ url: 'https://example.com' }, params)
      ).toHaveLength(0);
      expect(validateParameters({ url: 'not a url' }, params)).toHaveLength(1);
    });
  });

  describe('executeTool', () => {
    it('succeeds with valid params', () => {
      const tool = makeTool({
        parameters: [
          { name: 'q', type: 'string', description: 'Query', required: true },
        ],
      });
      const result = executeTool(tool, { q: 'test' });
      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
    });

    it('fails with validation errors', () => {
      const tool = makeTool({
        parameters: [
          { name: 'q', type: 'string', description: 'Query', required: true },
        ],
      });
      const result = executeTool(tool, {});
      expect(result.success).toBe(false);
      expect(result.validationErrors!.length).toBeGreaterThan(0);
    });

    it('succeeds with no parameters', () => {
      const tool = makeTool();
      const result = executeTool(tool, {});
      expect(result.success).toBe(true);
    });
  });

  describe('testResource', () => {
    it('returns text content for text/ mimeType', () => {
      const resource = makeResource({ mimeType: 'text/plain' });
      const result = testResource(resource);
      expect(result.success).toBe(true);
      expect(typeof (result.result as Record<string, unknown>).content).toBe('string');
    });

    it('returns JSON content for application/json', () => {
      const resource = makeResource({
        uri: 'db://config',
        mimeType: 'application/json',
      });
      const result = testResource(resource);
      expect(result.success).toBe(true);
      expect(typeof (result.result as Record<string, unknown>).content).toBe('object');
    });

    it('returns image stub for image/ mimeType', () => {
      const resource = makeResource({ mimeType: 'image/png' });
      const result = testResource(resource);
      expect(result.success).toBe(true);
      const content = (result.result as Record<string, unknown>).content as Record<string, unknown>;
      expect(content.type).toBe('image');
    });

    it('returns binary stub for unknown mimeType', () => {
      const resource = makeResource({ mimeType: 'application/octet-stream' });
      const result = testResource(resource);
      expect(result.success).toBe(true);
      const content = (result.result as Record<string, unknown>).content as Record<string, unknown>;
      expect(content.type).toBe('binary');
    });
  });

  describe('testPrompt', () => {
    it('succeeds with valid arguments', () => {
      const prompt = makePrompt({
        arguments: [
          { name: 'topic', type: 'string', description: 'Topic', required: true },
        ],
      });
      const result = testPrompt(prompt, { topic: 'AI' });
      expect(result.success).toBe(true);
    });

    it('fails with missing required arguments', () => {
      const prompt = makePrompt({
        arguments: [
          { name: 'topic', type: 'string', description: 'Topic', required: true },
        ],
      });
      const result = testPrompt(prompt, {});
      expect(result.success).toBe(false);
    });

    it('formats content for code review prompts', () => {
      const prompt = makePrompt({
        name: 'code_review',
        description: 'Review code',
        arguments: [
          { name: 'code', type: 'string', description: 'Code', required: true },
        ],
      });
      const result = testPrompt(prompt, { code: 'console.log("hi")' });
      const content = (result.result as Record<string, unknown>).formattedContent as string;
      expect(content).toContain('review');
    });
  });

  describe('runBatchValidation', () => {
    it('validates tools, resources, and prompts', () => {
      const tool = makeTool({ name: 'valid_tool', description: 'desc' });
      const resource = makeResource();
      const prompt = makePrompt();
      const result = runBatchValidation([tool], [resource], [prompt]);
      expect(result.summary.total).toBe(3);
      expect(result.summary.passed).toBe(3);
      expect(result.summary.failed).toBe(0);
    });

    it('catches tool names that do not start with a letter', () => {
      const tool = makeTool({ name: '123invalid' });
      const result = runBatchValidation([tool], [], []);
      expect(result.summary.failed).toBe(1);
    });

    it('allows tool names with spaces (sanitized during code generation)', () => {
      const tool = makeTool({ name: 'Web Search Tool' });
      const result = runBatchValidation([tool], [], []);
      expect(result.summary.passed).toBe(1);
    });

    it('catches missing resource URI', () => {
      const resource = makeResource({ uri: '' });
      const result = runBatchValidation([], [resource], []);
      expect(result.summary.failed).toBe(1);
    });

    it('catches invalid MIME type', () => {
      const resource = makeResource({ mimeType: 'invalid' });
      const result = runBatchValidation([], [resource], []);
      expect(result.summary.failed).toBe(1);
    });

    it('catches resource URI without protocol', () => {
      const resource = makeResource({ uri: '/just/a/path' });
      const result = runBatchValidation([], [resource], []);
      expect(result.summary.failed).toBe(1);
    });

    it('validates sampling config', () => {
      const tool = makeTool({
        sampling: { enabled: true, maxTokens: 0 },
      });
      const result = runBatchValidation([tool], [], []);
      expect(result.tools[0].result.success).toBe(false);
    });

    it('validates elicitation config in form mode', () => {
      const tool = makeTool({
        elicitation: {
          enabled: true,
          mode: 'form',
          message: 'Test',
          formFields: [],
        },
      });
      const result = runBatchValidation([tool], [], []);
      expect(result.tools[0].result.success).toBe(false);
    });
  });

  describe('simulateToolCall / generateChatResponse', () => {
    it('matches tool by keyword', () => {
      const tools = [makeTool({ name: 'search users', description: 'Find users' })];
      const result = simulateToolCall('search for someone', tools);
      expect(result).not.toBeNull();
      expect(result!.toolName).toBe('search users');
    });

    it('returns null when no tool matches', () => {
      const tools = [makeTool({ name: 'search users', description: 'Find users' })];
      expect(simulateToolCall('zzzzz', tools)).toBeNull();
    });

    it('generateChatResponse returns assistant message', () => {
      const tools = [makeTool({ name: 'search', description: 'Search' })];
      const msg = generateChatResponse('search something', tools);
      expect(msg.role).toBe('assistant');
      expect(msg.id).toMatch(/^assistant-/);
    });

    it('generateChatResponse returns fallback when no match', () => {
      const msg = generateChatResponse('zzzzz', []);
      expect(msg.role).toBe('assistant');
      expect(msg.content).toContain("couldn't find");
    });
  });
});
