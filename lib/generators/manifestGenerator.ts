import { MCPServerConfig, MCPParameter, MCPTool } from '../types';

function generateJsonSchema(parameters: MCPParameter[]): Record<string, unknown> {
  const properties: Record<string, Record<string, unknown>> = {};
  const required: string[] = [];

  parameters.forEach((param) => {
    const property: Record<string, unknown> = {
      type: param.type,
      description: param.description,
    };

    // Default value (all types)
    if (param.default !== undefined) {
      property.default = param.default;
    }

    // String constraints
    if (param.enum !== undefined && param.enum.length > 0) {
      property.enum = param.enum;
    }
    if (param.format !== undefined) {
      property.format = param.format;
    }
    if (param.minLength !== undefined) {
      property.minLength = param.minLength;
    }
    if (param.maxLength !== undefined) {
      property.maxLength = param.maxLength;
    }
    if (param.pattern !== undefined) {
      property.pattern = param.pattern;
    }

    // Number constraints
    if (param.minimum !== undefined) {
      property.minimum = param.minimum;
    }
    if (param.maximum !== undefined) {
      property.maximum = param.maximum;
    }

    // Array constraints
    if (param.minItems !== undefined) {
      property.minItems = param.minItems;
    }
    if (param.maxItems !== undefined) {
      property.maxItems = param.maxItems;
    }
    if (param.uniqueItems === true) {
      property.uniqueItems = true;
    }

    properties[param.name] = property;

    if (param.required) {
      required.push(param.name);
    }
  });

  return {
    type: 'object',
    properties,
    required,
  };
}

function generateToolManifest(tool: MCPTool): Record<string, unknown> {
  const manifest: Record<string, unknown> = {
    name: tool.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
    description: tool.description,
    icon: tool.icon,
    inputSchema: generateJsonSchema(tool.parameters),
  };

  // Include capability markers
  if (tool.sampling?.enabled) {
    manifest.usesSampling = true;
  }
  if (tool.elicitation?.enabled) {
    manifest.usesElicitation = true;
  }
  if (tool.tasks?.enabled) {
    manifest.isLongRunning = true;
  }

  return manifest;
}

export function generateManifest(config: MCPServerConfig): Record<string, unknown> {
  const hasSampling = config.tools.some(t => t.sampling?.enabled);
  const hasElicitation = config.tools.some(t => t.elicitation?.enabled);

  return {
    name: config.name,
    version: config.version,
    capabilities: {
      tools: config.tools.length > 0,
      resources: (config.resources || []).length > 0,
      prompts: (config.prompts || []).length > 0,
      sampling: hasSampling,
      elicitation: hasElicitation,
    },
    tools: config.tools.map(generateToolManifest),
  };
}
