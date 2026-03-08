import { describe, it, expect } from 'vitest';
import { parseOpenApiSpec } from '../openApiImporter';

const minimalSpec = {
  openapi: '3.0.0',
  info: { title: 'Test API', version: '1.0.0' },
  paths: {
    '/users': {
      get: {
        operationId: 'listUsers',
        summary: 'List all users',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            description: 'Max results',
            required: false,
            schema: { type: 'integer' },
          },
        ],
      },
      post: {
        operationId: 'createUser',
        summary: 'Create a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'User name' },
                  age: { type: 'integer', description: 'User age' },
                },
                required: ['name'],
              },
            },
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        operationId: 'getUser',
        summary: 'Get a user by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
      },
      delete: {
        summary: 'Delete a user',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
      },
    },
  },
};

describe('openApiImporter', () => {
  describe('parseOpenApiSpec - JSON', () => {
    it('parses a valid OpenAPI 3.0 spec', () => {
      const result = parseOpenApiSpec(JSON.stringify(minimalSpec));
      expect(result.success).toBe(true);
      expect(result.tools.length).toBe(4);
      expect(result.errors).toHaveLength(0);
    });

    it('extracts tool names from operationId', () => {
      const result = parseOpenApiSpec(JSON.stringify(minimalSpec));
      const names = result.tools.map(t => t.name);
      expect(names).toContain('list_users');
      expect(names).toContain('create_user');
      expect(names).toContain('get_user');
    });

    it('generates tool name from method+path when no operationId', () => {
      const result = parseOpenApiSpec(JSON.stringify(minimalSpec));
      // The delete operation has no operationId
      const deleteTool = result.tools.find(t => t.name.includes('delete'));
      expect(deleteTool).toBeDefined();
    });

    it('extracts query parameters', () => {
      const result = parseOpenApiSpec(JSON.stringify(minimalSpec));
      const listTool = result.tools.find(t => t.name === 'list_users')!;
      expect(listTool.parameters).toHaveLength(1);
      expect(listTool.parameters[0].name).toBe('limit');
      expect(listTool.parameters[0].type).toBe('number');
    });

    it('extracts request body properties', () => {
      const result = parseOpenApiSpec(JSON.stringify(minimalSpec));
      const createTool = result.tools.find(t => t.name === 'create_user')!;
      expect(createTool.parameters.length).toBe(2);
      const nameParam = createTool.parameters.find(p => p.name === 'name')!;
      expect(nameParam.type).toBe('string');
      expect(nameParam.required).toBe(true);
      const ageParam = createTool.parameters.find(p => p.name === 'age')!;
      expect(ageParam.type).toBe('number');
      expect(ageParam.required).toBe(false);
    });

    it('selects appropriate icons based on path content', () => {
      const result = parseOpenApiSpec(JSON.stringify(minimalSpec));
      // /users path matches 'user' keyword → Users icon takes priority over method-based icon
      const deleteTool = result.tools.find(t => t.name.includes('delete'))!;
      expect(deleteTool.icon).toBe('Users');
    });

    it('assigns unique IDs to each tool', () => {
      const result = parseOpenApiSpec(JSON.stringify(minimalSpec));
      const ids = result.tools.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('parseOpenApiSpec - Swagger 2.0', () => {
    it('parses a Swagger 2.0 spec', () => {
      const swagger = {
        swagger: '2.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/items': {
            get: {
              operationId: 'getItems',
              summary: 'Get items',
              parameters: [
                { name: 'q', in: 'query', type: 'string', required: false },
              ],
            },
          },
        },
      };
      const result = parseOpenApiSpec(JSON.stringify(swagger));
      expect(result.success).toBe(true);
      expect(result.tools).toHaveLength(1);
      expect(result.tools[0].parameters[0].type).toBe('string');
    });
  });

  describe('parseOpenApiSpec - error cases', () => {
    it('returns error for invalid JSON/YAML', () => {
      const result = parseOpenApiSpec('not valid json {{{');
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('returns error when missing openapi/swagger field', () => {
      const result = parseOpenApiSpec(JSON.stringify({ paths: {} }));
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('missing');
    });

    it('returns error when no paths defined', () => {
      const result = parseOpenApiSpec(
        JSON.stringify({ openapi: '3.0.0', paths: {} })
      );
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('No API paths');
    });

    it('returns error when no valid operations found', () => {
      const result = parseOpenApiSpec(
        JSON.stringify({
          openapi: '3.0.0',
          paths: { '/test': { summary: 'not an operation' } },
        })
      );
      expect(result.success).toBe(false);
    });

    it('truncates overly long descriptions', () => {
      const longSpec = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              summary: 'A'.repeat(250),
            },
          },
        },
      };
      const result = parseOpenApiSpec(JSON.stringify(longSpec));
      expect(result.tools[0].description.length).toBeLessThanOrEqual(200);
      expect(result.tools[0].description).toContain('...');
    });
  });

  describe('parseOpenApiSpec - $ref resolution', () => {
    it('resolves $ref in request body schema', () => {
      const specWithRef = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/pets': {
            post: {
              operationId: 'createPet',
              summary: 'Create pet',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Pet' },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Pet: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Pet name' },
                species: { type: 'string', description: 'Species' },
              },
              required: ['name'],
            },
          },
        },
      };
      const result = parseOpenApiSpec(JSON.stringify(specWithRef));
      expect(result.success).toBe(true);
      const tool = result.tools[0];
      expect(tool.parameters.length).toBe(2);
      expect(tool.parameters.find(p => p.name === 'name')!.required).toBe(true);
    });

    it('resolves nested $ref chains', () => {
      const spec = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/orders': {
            post: {
              operationId: 'createOrder',
              summary: 'Create order',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/OrderAlias' },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            OrderAlias: { $ref: '#/components/schemas/Order' },
            Order: {
              type: 'object',
              properties: {
                product: { type: 'string', description: 'Product name' },
                qty: { type: 'integer', description: 'Quantity' },
              },
              required: ['product'],
            },
          },
        },
      };
      const result = parseOpenApiSpec(JSON.stringify(spec));
      expect(result.success).toBe(true);
      expect(result.tools[0].parameters.length).toBe(2);
      expect(result.tools[0].parameters.find(p => p.name === 'product')!.required).toBe(true);
    });

    it('handles circular $ref without infinite loop', () => {
      const spec = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/nodes': {
            post: {
              operationId: 'createNode',
              summary: 'Create a tree node',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Node' },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Node: {
              type: 'object',
              properties: {
                value: { type: 'string' },
                children: { type: 'array', items: { $ref: '#/components/schemas/Node' } },
              },
            },
          },
        },
      };
      // Should not hang — circular ref is handled gracefully
      const result = parseOpenApiSpec(JSON.stringify(spec));
      expect(result.success).toBe(true);
    });

    it('returns original schema when $ref target is missing', () => {
      const spec = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/items': {
            post: {
              operationId: 'createItem',
              summary: 'Create item',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/NonExistent' },
                  },
                },
              },
            },
          },
        },
        components: { schemas: {} },
      };
      const result = parseOpenApiSpec(JSON.stringify(spec));
      // Should not crash, tool is still created
      expect(result.success).toBe(true);
    });
  });

  describe('parseOpenApiSpec - YAML', () => {
    it('parses a valid OpenAPI YAML spec', () => {
      const yamlSpec = `
openapi: "3.0.0"
info:
  title: Pet Store
  version: "1.0.0"
paths:
  /pets:
    get:
      operationId: listPets
      summary: List all pets
      parameters:
        - name: limit
          in: query
          required: false
          schema:
            type: integer
`;
      const result = parseOpenApiSpec(yamlSpec);
      expect(result.success).toBe(true);
      expect(result.tools).toHaveLength(1);
      expect(result.tools[0].name).toBe('list_pets');
      expect(result.tools[0].parameters[0].name).toBe('limit');
      expect(result.tools[0].parameters[0].type).toBe('number');
    });

    it('parses YAML with $ref and components', () => {
      const yamlSpec = `
openapi: "3.0.0"
info:
  title: Ref API
  version: "1.0.0"
paths:
  /widgets:
    post:
      operationId: createWidget
      summary: Create a widget
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Widget"
components:
  schemas:
    Widget:
      type: object
      properties:
        color:
          type: string
          description: Widget color
        weight:
          type: number
          description: Widget weight
      required:
        - color
`;
      const result = parseOpenApiSpec(yamlSpec);
      expect(result.success).toBe(true);
      expect(result.tools[0].parameters).toHaveLength(2);
      expect(result.tools[0].parameters.find(p => p.name === 'color')!.required).toBe(true);
    });

    it('returns descriptive error for invalid YAML', () => {
      const result = parseOpenApiSpec('  :\n  bad: [yaml:');
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Failed to parse');
    });

    it('parses Swagger 2.0 YAML', () => {
      const yamlSpec = `
swagger: "2.0"
info:
  title: Legacy API
  version: "1.0.0"
paths:
  /things:
    get:
      operationId: getThings
      summary: Get things
      parameters:
        - name: search
          in: query
          type: string
          required: false
`;
      const result = parseOpenApiSpec(yamlSpec);
      expect(result.success).toBe(true);
      expect(result.tools).toHaveLength(1);
      expect(result.tools[0].parameters[0].type).toBe('string');
    });
  });
});
