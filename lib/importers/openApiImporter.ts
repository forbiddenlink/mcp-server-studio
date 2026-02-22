import { MCPTool, MCPParameter, ParameterType } from '../types';

/**
 * Represents a parsed OpenAPI parameter
 */
interface OpenAPIParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie' | 'body';
  description?: string;
  required?: boolean;
  schema?: OpenAPISchema;
  type?: string; // Swagger 2.0
}

/**
 * Represents an OpenAPI schema object
 */
interface OpenAPISchema {
  type?: string;
  format?: string;
  description?: string;
  properties?: Record<string, OpenAPISchema>;
  items?: OpenAPISchema;
  required?: string[];
  $ref?: string;
}

/**
 * Represents an OpenAPI operation
 */
interface OpenAPIOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: OpenAPIParameter[];
  requestBody?: {
    description?: string;
    required?: boolean;
    content?: Record<string, { schema?: OpenAPISchema }>;
  };
}

/**
 * Represents the parsed OpenAPI spec structure
 */
interface OpenAPISpec {
  openapi?: string; // OpenAPI 3.x
  swagger?: string; // Swagger 2.0
  info?: {
    title?: string;
    version?: string;
  };
  paths?: Record<string, Record<string, OpenAPIOperation>>;
  definitions?: Record<string, OpenAPISchema>; // Swagger 2.0
  components?: {
    schemas?: Record<string, OpenAPISchema>;
  };
}

/**
 * Result of parsing an OpenAPI spec
 */
export interface ParseResult {
  success: boolean;
  tools: MCPTool[];
  errors: string[];
  warnings: string[];
}

/**
 * Maps OpenAPI type to MCP ParameterType
 */
function mapOpenAPIType(type: string | undefined, format?: string): ParameterType {
  switch (type) {
    case 'string':
      return 'string';
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return 'array';
    case 'object':
      return 'object';
    default:
      return 'string';
  }
}

/**
 * Converts an OpenAPI parameter to an MCPParameter
 */
function convertParameter(param: OpenAPIParameter): MCPParameter {
  let type: ParameterType = 'string';

  // OpenAPI 3.x uses schema
  if (param.schema) {
    type = mapOpenAPIType(param.schema.type, param.schema.format);
  }
  // Swagger 2.0 uses type directly
  else if (param.type) {
    type = mapOpenAPIType(param.type);
  }

  return {
    name: param.name,
    type,
    description: param.description || `${param.in} parameter`,
    required: param.required || false,
  };
}

/**
 * Extracts parameters from a request body (OpenAPI 3.x)
 */
function extractBodyParameters(
  requestBody: OpenAPIOperation['requestBody'],
  spec: OpenAPISpec
): MCPParameter[] {
  if (!requestBody?.content) {
    return [];
  }

  const params: MCPParameter[] = [];

  // Look for JSON content
  const jsonContent = requestBody.content['application/json'];
  if (jsonContent?.schema) {
    const schema = resolveSchema(jsonContent.schema, spec);

    if (schema.type === 'object' && schema.properties) {
      const requiredProps = schema.required || [];

      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        params.push({
          name: propName,
          type: mapOpenAPIType(propSchema.type),
          description: propSchema.description || 'Request body property',
          required: requiredProps.includes(propName),
        });
      }
    } else {
      // Treat entire body as single parameter
      params.push({
        name: 'body',
        type: mapOpenAPIType(schema.type),
        description: requestBody.description || 'Request body',
        required: requestBody.required || false,
      });
    }
  }

  return params;
}

/**
 * Resolves a $ref to its actual schema
 */
function resolveSchema(schema: OpenAPISchema, spec: OpenAPISpec): OpenAPISchema {
  if (!schema.$ref) {
    return schema;
  }

  // Handle $ref like "#/components/schemas/Pet" or "#/definitions/Pet"
  const refPath = schema.$ref.replace(/^#\//, '').split('/');

  let resolved: any = spec;
  for (const part of refPath) {
    resolved = resolved?.[part];
  }

  return resolved || schema;
}

/**
 * Generates a tool name from operation details
 */
function generateToolName(
  method: string,
  path: string,
  operation: OpenAPIOperation
): string {
  if (operation.operationId) {
    // Clean up operationId - convert camelCase or PascalCase to snake_case
    return operation.operationId
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase()
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  // Generate from method and path
  const pathParts = path
    .split('/')
    .filter(Boolean)
    .map(part => part.replace(/[{}]/g, ''))
    .join('_');

  return `${method.toLowerCase()}_${pathParts}`.replace(/_+/g, '_');
}

/**
 * Selects an appropriate icon based on operation
 */
function selectIcon(method: string, path: string, operation: OpenAPIOperation): string {
  const lowerPath = path.toLowerCase();
  const lowerDesc = (operation.description || operation.summary || '').toLowerCase();

  // Match by common patterns
  if (lowerPath.includes('search') || lowerDesc.includes('search')) {
    return 'Search';
  }
  if (lowerPath.includes('file') || lowerDesc.includes('file') || lowerDesc.includes('upload')) {
    return 'FileText';
  }
  if (lowerPath.includes('user') || lowerPath.includes('auth')) {
    return 'Users';
  }
  if (lowerPath.includes('email') || lowerPath.includes('mail')) {
    return 'Mail';
  }
  if (lowerPath.includes('image') || lowerPath.includes('photo')) {
    return 'Image';
  }
  if (lowerPath.includes('database') || lowerPath.includes('db')) {
    return 'Database';
  }

  // Match by HTTP method
  switch (method.toLowerCase()) {
    case 'get':
      return 'Search';
    case 'post':
      return 'FilePlus';
    case 'put':
    case 'patch':
      return 'FileText';
    case 'delete':
      return 'Trash';
    default:
      return 'Globe';
  }
}

/**
 * Parses an OpenAPI/Swagger specification and converts it to MCPTool array
 */
export function parseOpenApiSpec(spec: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const tools: MCPTool[] = [];

  // Try to parse as JSON
  let parsedSpec: OpenAPISpec;
  try {
    parsedSpec = JSON.parse(spec);
  } catch (jsonError) {
    // Try basic YAML parsing for simple cases
    try {
      parsedSpec = parseSimpleYaml(spec);
    } catch (yamlError) {
      return {
        success: false,
        tools: [],
        errors: ['Failed to parse specification. Please provide valid JSON or simple YAML.'],
        warnings: [],
      };
    }
  }

  // Validate it's an OpenAPI spec
  if (!parsedSpec.openapi && !parsedSpec.swagger) {
    return {
      success: false,
      tools: [],
      errors: ['Invalid specification: missing "openapi" or "swagger" version field.'],
      warnings: [],
    };
  }

  // Check for paths
  if (!parsedSpec.paths || Object.keys(parsedSpec.paths).length === 0) {
    return {
      success: false,
      tools: [],
      errors: ['No API paths found in specification.'],
      warnings: [],
    };
  }

  const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

  // Process each path and operation
  for (const [path, pathItem] of Object.entries(parsedSpec.paths)) {
    if (!pathItem) continue;

    for (const [method, operation] of Object.entries(pathItem)) {
      // Skip non-HTTP method fields
      if (!httpMethods.includes(method.toLowerCase())) {
        continue;
      }

      if (!operation || typeof operation !== 'object') {
        continue;
      }

      try {
        const toolName = generateToolName(method, path, operation);
        const parameters: MCPParameter[] = [];

        // Add path parameters as context in description
        const pathParams = path.match(/\{([^}]+)\}/g)?.map(p => p.slice(1, -1)) || [];

        // Process operation parameters
        if (operation.parameters) {
          for (const param of operation.parameters) {
            try {
              parameters.push(convertParameter(param));
            } catch (e) {
              warnings.push(`Skipped parameter "${param.name}" in ${method.toUpperCase()} ${path}: ${e}`);
            }
          }
        }

        // Process request body (OpenAPI 3.x)
        if (operation.requestBody) {
          const bodyParams = extractBodyParameters(operation.requestBody, parsedSpec);
          parameters.push(...bodyParams);
        }

        // Create description
        let description = operation.summary || operation.description || `${method.toUpperCase()} ${path}`;
        if (description.length > 200) {
          description = description.substring(0, 197) + '...';
        }

        const tool: MCPTool = {
          id: `tool-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: toolName,
          description,
          icon: selectIcon(method, path, operation),
          parameters,
        };

        tools.push(tool);
      } catch (e) {
        warnings.push(`Skipped operation ${method.toUpperCase()} ${path}: ${e}`);
      }
    }
  }

  if (tools.length === 0) {
    errors.push('No valid operations found in specification.');
    return {
      success: false,
      tools: [],
      errors,
      warnings,
    };
  }

  return {
    success: true,
    tools,
    errors,
    warnings,
  };
}

/**
 * Simple YAML parser for basic OpenAPI specs
 * Only handles simple key-value pairs, arrays, and nested objects
 */
function parseSimpleYaml(yaml: string): OpenAPISpec {
  const lines = yaml.split('\n');
  const result: any = {};
  const stack: { obj: any; indent: number }[] = [{ obj: result, indent: -1 }];
  let currentKey = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const indent = line.search(/\S/);

    // Pop stack until we find the right parent
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].obj;

    // Array item
    if (trimmed.startsWith('- ')) {
      const value = trimmed.substring(2).trim();
      if (!Array.isArray(parent[currentKey])) {
        parent[currentKey] = [];
      }

      if (value.includes(':')) {
        // Object in array
        const obj: any = {};
        const [k, v] = value.split(':').map(s => s.trim());
        obj[k] = parseYamlValue(v);
        parent[currentKey].push(obj);
        stack.push({ obj: obj, indent: indent });
      } else {
        parent[currentKey].push(parseYamlValue(value));
      }
      continue;
    }

    // Key-value pair
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex > 0) {
      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();

      if (value) {
        parent[key] = parseYamlValue(value);
      } else {
        parent[key] = {};
        currentKey = key;
        stack.push({ obj: parent[key], indent: indent });
      }
    }
  }

  return result;
}

/**
 * Parses a YAML value string
 */
function parseYamlValue(value: string): any {
  if (!value) return '';

  // Remove quotes
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  // Boolean
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Null
  if (value === 'null' || value === '~') return null;

  // Number
  const num = Number(value);
  if (!isNaN(num)) return num;

  return value;
}

/**
 * Fetches and parses an OpenAPI spec from a URL
 */
export async function fetchAndParseOpenApiSpec(url: string): Promise<ParseResult> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return {
        success: false,
        tools: [],
        errors: [`Failed to fetch spec: ${response.status} ${response.statusText}`],
        warnings: [],
      };
    }

    const spec = await response.text();
    return parseOpenApiSpec(spec);
  } catch (error) {
    return {
      success: false,
      tools: [],
      errors: [`Failed to fetch spec: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
    };
  }
}
