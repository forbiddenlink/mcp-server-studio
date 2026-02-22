import { MCPTool, MCPResource, MCPPrompt, MCPParameter, ChatMessage, SamplingConfig, ElicitationConfig } from '../types';

// Structured test result format
export interface TestResult {
  success: boolean;
  result?: unknown;
  error?: string;
  validationErrors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

interface SimulatedResponse {
  toolName: string;
  parameters: Record<string, unknown>;
  result: string;
}

// Format validation patterns
const FORMAT_PATTERNS: Record<string, RegExp> = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  uri: /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  date: /^\d{4}-\d{2}-\d{2}$/,
  'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/,
};

// Schema validation for tool parameters
export function validateParameters(
  params: Record<string, unknown>,
  schema: MCPParameter[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const param of schema) {
    const value = params[param.name];

    // Check required fields
    if (param.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: param.name,
        message: `${param.name} is required`,
      });
      continue;
    }

    // Skip validation for optional undefined values
    if (value === undefined || value === null) continue;

    // Type validation
    switch (param.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push({
            field: param.name,
            message: `${param.name} must be a string`,
          });
        } else {
          // Validate enum constraint
          if (param.enum && param.enum.length > 0) {
            if (!param.enum.includes(value)) {
              errors.push({
                field: param.name,
                message: `${param.name} must be one of: ${param.enum.join(', ')}`,
              });
            }
          }

          // Validate format constraint
          if (param.format) {
            const pattern = FORMAT_PATTERNS[param.format];
            if (pattern && !pattern.test(value)) {
              errors.push({
                field: param.name,
                message: `${param.name} must be a valid ${param.format}`,
              });
            }
          }

          // Validate minLength constraint
          if (param.minLength !== undefined && value.length < param.minLength) {
            errors.push({
              field: param.name,
              message: `${param.name} must be at least ${param.minLength} characters`,
            });
          }

          // Validate maxLength constraint
          if (param.maxLength !== undefined && value.length > param.maxLength) {
            errors.push({
              field: param.name,
              message: `${param.name} must be at most ${param.maxLength} characters`,
            });
          }

          // Validate pattern constraint
          if (param.pattern) {
            const regex = new RegExp(param.pattern);
            if (!regex.test(value)) {
              errors.push({
                field: param.name,
                message: `${param.name} must match pattern: /${param.pattern}/`,
              });
            }
          }
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push({
            field: param.name,
            message: `${param.name} must be a number`,
          });
        } else {
          // Validate minimum constraint
          if (param.minimum !== undefined && value < param.minimum) {
            errors.push({
              field: param.name,
              message: `${param.name} must be at least ${param.minimum}`,
            });
          }

          // Validate maximum constraint
          if (param.maximum !== undefined && value > param.maximum) {
            errors.push({
              field: param.name,
              message: `${param.name} must be at most ${param.maximum}`,
            });
          }
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push({
            field: param.name,
            message: `${param.name} must be a boolean`,
          });
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          errors.push({
            field: param.name,
            message: `${param.name} must be an array`,
          });
        } else {
          // Validate minItems constraint
          if (param.minItems !== undefined && value.length < param.minItems) {
            errors.push({
              field: param.name,
              message: `${param.name} must have at least ${param.minItems} items`,
            });
          }

          // Validate maxItems constraint
          if (param.maxItems !== undefined && value.length > param.maxItems) {
            errors.push({
              field: param.name,
              message: `${param.name} must have at most ${param.maxItems} items`,
            });
          }

          // Validate uniqueItems constraint
          if (param.uniqueItems && new Set(value).size !== value.length) {
            errors.push({
              field: param.name,
              message: `${param.name} must have unique items`,
            });
          }
        }
        break;
      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          errors.push({
            field: param.name,
            message: `${param.name} must be an object`,
          });
        }
        break;
    }
  }

  return errors;
}

// Execute a tool with validation
export function executeTool(
  tool: MCPTool,
  params: Record<string, unknown>
): TestResult {
  // Validate parameters
  const validationErrors = validateParameters(params, tool.parameters);

  if (validationErrors.length > 0) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors,
    };
  }

  // Simulate successful execution
  return {
    success: true,
    result: {
      message: `Tool "${tool.name}" executed successfully`,
      parameters: params,
      executedAt: new Date().toISOString(),
    },
  };
}

// Test a resource - returns mock content based on URI and mimeType
export function testResource(resource: MCPResource): TestResult {
  const { uri, mimeType } = resource;

  // Generate mock content based on mimeType
  let content: unknown;

  if (mimeType.startsWith('text/')) {
    content = generateTextContent(uri, mimeType);
  } else if (mimeType === 'application/json') {
    content = generateJsonContent(uri);
  } else if (mimeType.startsWith('image/')) {
    content = {
      type: 'image',
      url: uri,
      mimeType,
      note: 'Image preview not available in test mode',
    };
  } else {
    content = {
      type: 'binary',
      uri,
      mimeType,
      size: Math.floor(Math.random() * 10000) + 1000,
      note: 'Binary content simulated',
    };
  }

  return {
    success: true,
    result: {
      uri,
      mimeType,
      content,
      retrievedAt: new Date().toISOString(),
    },
  };
}

function generateTextContent(uri: string, mimeType: string): string {
  if (uri.includes('README') || uri.includes('readme')) {
    return `# ${uri.split('/').pop()}\n\nThis is a simulated README file.\n\n## Features\n- Feature 1\n- Feature 2\n\n## Usage\n\`\`\`bash\nnpm install\nnpm start\n\`\`\``;
  }

  if (mimeType === 'text/html') {
    return `<!DOCTYPE html>\n<html>\n<head>\n  <title>Test Page</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>`;
  }

  if (mimeType === 'text/css') {
    return `/* Generated CSS */\nbody {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n}`;
  }

  return `# Content from ${uri}\n\nThis is simulated text content for testing purposes.`;
}

function generateJsonContent(uri: string): Record<string, unknown> {
  if (uri.includes('config')) {
    return {
      name: 'test-config',
      version: '1.0.0',
      settings: {
        debug: false,
        logLevel: 'info',
      },
    };
  }

  if (uri.includes('users') || uri.includes('user')) {
    return {
      users: [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ],
    };
  }

  if (uri.includes('schema')) {
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
      },
    };
  }

  return {
    data: 'simulated',
    uri,
    generatedAt: new Date().toISOString(),
  };
}

// Test a prompt - returns formatted prompt with arguments filled in
export function testPrompt(
  prompt: MCPPrompt,
  args: Record<string, unknown>
): TestResult {
  // Validate arguments
  const validationErrors = validateParameters(args, prompt.arguments);

  if (validationErrors.length > 0) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors,
    };
  }

  // Generate the formatted prompt
  let formattedContent = `# ${prompt.name}\n\n${prompt.description}\n\n`;

  // Add arguments section
  if (prompt.arguments.length > 0) {
    formattedContent += '## Arguments\n\n';
    for (const arg of prompt.arguments) {
      const value = args[arg.name];
      formattedContent += `- **${arg.name}**: ${value !== undefined ? String(value) : '(not provided)'}\n`;
    }
    formattedContent += '\n';
  }

  // Generate sample prompt output
  formattedContent += '## Generated Prompt\n\n';
  formattedContent += generatePromptContent(prompt, args);

  return {
    success: true,
    result: {
      name: prompt.name,
      formattedContent,
      arguments: args,
      generatedAt: new Date().toISOString(),
    },
  };
}

function generatePromptContent(
  prompt: MCPPrompt,
  args: Record<string, unknown>
): string {
  // Generate contextual prompt based on name/description
  const name = prompt.name.toLowerCase();

  if (name.includes('code') || name.includes('review')) {
    const language = args.language || 'TypeScript';
    const code = args.code || '// sample code';
    return `Please review the following ${language} code:\n\n\`\`\`${String(language).toLowerCase()}\n${code}\n\`\`\`\n\nProvide feedback on code quality, potential issues, and suggestions for improvement.`;
  }

  if (name.includes('explain') || name.includes('help')) {
    const topic = args.topic || args.query || 'the topic';
    return `Please explain ${topic} in a clear and concise manner. Include examples where appropriate.`;
  }

  if (name.includes('summarize') || name.includes('summary')) {
    const content = args.content || args.text || '[content to summarize]';
    return `Please summarize the following:\n\n${content}\n\nProvide a concise summary highlighting key points.`;
  }

  if (name.includes('translate')) {
    const text = args.text || args.content || '[text to translate]';
    const targetLang = args.targetLanguage || args.language || 'Spanish';
    return `Please translate the following text to ${targetLang}:\n\n${text}`;
  }

  // Default template
  let content = `${prompt.description}\n\n`;
  for (const [key, value] of Object.entries(args)) {
    if (value !== undefined && value !== '') {
      content += `${key}: ${String(value)}\n`;
    }
  }
  return content;
}

// Run validation tests on all items
export interface BatchTestResult {
  tools: { item: MCPTool; result: TestResult }[];
  resources: { item: MCPResource; result: TestResult }[];
  prompts: { item: MCPPrompt; result: TestResult }[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}

export function runBatchValidation(
  tools: MCPTool[],
  resources: MCPResource[],
  prompts: MCPPrompt[]
): BatchTestResult {
  const toolResults = tools.map((tool) => ({
    item: tool,
    result: validateToolSchema(tool),
  }));

  const resourceResults = resources.map((resource) => ({
    item: resource,
    result: validateResourceSchema(resource),
  }));

  const promptResults = prompts.map((prompt) => ({
    item: prompt,
    result: validatePromptSchema(prompt),
  }));

  const allResults = [...toolResults, ...resourceResults, ...promptResults];
  const passed = allResults.filter((r) => r.result.success).length;

  return {
    tools: toolResults,
    resources: resourceResults,
    prompts: promptResults,
    summary: {
      total: allResults.length,
      passed,
      failed: allResults.length - passed,
    },
  };
}

function validateSamplingConfig(sampling: SamplingConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  if (sampling.enabled) {
    if (!sampling.maxTokens || sampling.maxTokens < 1) {
      errors.push({ field: 'sampling.maxTokens', message: 'Max tokens must be at least 1' });
    }

    if (sampling.temperature !== undefined && (sampling.temperature < 0 || sampling.temperature > 2)) {
      errors.push({ field: 'sampling.temperature', message: 'Temperature must be between 0 and 2' });
    }
  }

  return errors;
}

function validateElicitationConfig(elicitation: ElicitationConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  if (elicitation.enabled) {
    if (!elicitation.message || elicitation.message.trim() === '') {
      errors.push({ field: 'elicitation.message', message: 'Elicitation message is required' });
    }

    if (elicitation.mode === 'form') {
      if (!elicitation.formFields || elicitation.formFields.length === 0) {
        errors.push({ field: 'elicitation.formFields', message: 'At least one form field is required in form mode' });
      } else {
        for (let i = 0; i < elicitation.formFields.length; i++) {
          const field = elicitation.formFields[i];
          if (!field.name || field.name.trim() === '') {
            errors.push({ field: `elicitation.formFields[${i}].name`, message: 'Form field name is required' });
          }
        }
      }
    }

    if (elicitation.mode === 'url') {
      if (!elicitation.url || elicitation.url.trim() === '') {
        errors.push({ field: 'elicitation.url', message: 'URL is required in URL mode' });
      }
    }
  }

  return errors;
}

function validateToolSchema(tool: MCPTool): TestResult {
  const errors: ValidationError[] = [];

  if (!tool.name || tool.name.trim() === '') {
    errors.push({ field: 'name', message: 'Tool name is required' });
  } else if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(tool.name)) {
    errors.push({ field: 'name', message: 'Tool name must start with a letter and contain only letters, numbers, underscores, and hyphens' });
  }

  if (!tool.description || tool.description.trim() === '') {
    errors.push({ field: 'description', message: 'Tool description is required' });
  }

  // Validate parameters
  for (let i = 0; i < tool.parameters.length; i++) {
    const param = tool.parameters[i];
    if (!param.name || param.name.trim() === '') {
      errors.push({ field: `parameters[${i}].name`, message: 'Parameter name is required' });
    }
  }

  // Validate sampling config
  if (tool.sampling) {
    errors.push(...validateSamplingConfig(tool.sampling));
  }

  // Validate elicitation config
  if (tool.elicitation) {
    errors.push(...validateElicitationConfig(tool.elicitation));
  }

  return {
    success: errors.length === 0,
    error: errors.length > 0 ? 'Schema validation failed' : undefined,
    validationErrors: errors.length > 0 ? errors : undefined,
  };
}

function validateResourceSchema(resource: MCPResource): TestResult {
  const errors: ValidationError[] = [];

  if (!resource.name || resource.name.trim() === '') {
    errors.push({ field: 'name', message: 'Resource name is required' });
  }

  if (!resource.uri || resource.uri.trim() === '') {
    errors.push({ field: 'uri', message: 'Resource URI is required' });
  } else {
    // Validate URI format
    try {
      // Simple check for protocol
      if (!resource.uri.includes('://')) {
        errors.push({ field: 'uri', message: 'Resource URI must include a protocol (e.g., file://, db://)' });
      }
    } catch {
      errors.push({ field: 'uri', message: 'Invalid URI format' });
    }
  }

  if (!resource.mimeType || resource.mimeType.trim() === '') {
    errors.push({ field: 'mimeType', message: 'MIME type is required' });
  } else if (!resource.mimeType.includes('/')) {
    errors.push({ field: 'mimeType', message: 'Invalid MIME type format (expected type/subtype)' });
  }

  return {
    success: errors.length === 0,
    error: errors.length > 0 ? 'Schema validation failed' : undefined,
    validationErrors: errors.length > 0 ? errors : undefined,
  };
}

function validatePromptSchema(prompt: MCPPrompt): TestResult {
  const errors: ValidationError[] = [];

  if (!prompt.name || prompt.name.trim() === '') {
    errors.push({ field: 'name', message: 'Prompt name is required' });
  }

  if (!prompt.description || prompt.description.trim() === '') {
    errors.push({ field: 'description', message: 'Prompt description is required' });
  }

  // Validate arguments
  for (let i = 0; i < prompt.arguments.length; i++) {
    const arg = prompt.arguments[i];
    if (!arg.name || arg.name.trim() === '') {
      errors.push({ field: `arguments[${i}].name`, message: 'Argument name is required' });
    }
  }

  return {
    success: errors.length === 0,
    error: errors.length > 0 ? 'Schema validation failed' : undefined,
    validationErrors: errors.length > 0 ? errors : undefined,
  };
}

// Legacy functions for chat-based testing (kept for compatibility)
function extractKeywords(prompt: string): string[] {
  return prompt.toLowerCase().split(/\s+/);
}

function matchTool(prompt: string, tools: MCPTool[]): MCPTool | null {
  const keywords = extractKeywords(prompt);

  for (const tool of tools) {
    const toolKeywords = tool.name.toLowerCase().split(/\s+/);
    const descKeywords = tool.description.toLowerCase().split(/\s+/);

    // Check if any prompt keywords match tool name or description
    for (const keyword of keywords) {
      if (toolKeywords.some(tk => tk.includes(keyword)) ||
          descKeywords.some(dk => dk.includes(keyword))) {
        return tool;
      }
    }
  }

  return null;
}

function extractParameters(prompt: string, tool: MCPTool): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  tool.parameters.forEach((param) => {
    if (param.type === 'string') {
      // Simple extraction: look for quoted strings or rest of prompt
      const match = prompt.match(/"([^"]+)"/);
      params[param.name] = match ? match[1] : prompt.split(' ').slice(1).join(' ');
    } else if (param.type === 'number') {
      const match = prompt.match(/\d+/);
      params[param.name] = match ? parseInt(match[0], 10) : 0;
    } else if (param.type === 'boolean') {
      params[param.name] = prompt.includes('true') || prompt.includes('yes');
    } else {
      params[param.name] = {};
    }
  });

  return params;
}

export function simulateToolCall(prompt: string, tools: MCPTool[]): SimulatedResponse | null {
  const matchedTool = matchTool(prompt, tools);

  if (!matchedTool) {
    return null;
  }

  const parameters = extractParameters(prompt, matchedTool);

  return {
    toolName: matchedTool.name,
    parameters,
    result: `Successfully executed ${matchedTool.icon} ${matchedTool.name} with parameters: ${JSON.stringify(parameters, null, 2)}`,
  };
}

export function generateChatResponse(prompt: string, tools: MCPTool[]): ChatMessage {
  const simulation = simulateToolCall(prompt, tools);
  const timestamp = Date.now();

  if (!simulation) {
    return {
      id: `assistant-${timestamp}`,
      role: 'assistant',
      content: "I couldn't find a matching tool for that request. Try being more specific or add more tools to your server.",
      timestamp,
    };
  }

  return {
    id: `assistant-${timestamp}`,
    role: 'assistant',
    content: simulation.result,
    toolCall: {
      toolName: simulation.toolName,
      parameters: simulation.parameters,
    },
    timestamp,
  };
}
