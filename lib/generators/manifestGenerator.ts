import { MCPServerConfig, MCPParameter, MCPTool } from '../types';

function generateJsonSchema(parameters: MCPParameter[]): Record<string, any> {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  parameters.forEach((param) => {
    const property: Record<string, any> = {
      type: param.type,
      description: param.description,
    };

    // String constraints
    if (param.enum !== undefined && param.enum.length > 0) {
      property.enum = param.enum;
    }
    if (param.format !== undefined) {
      property.format = param.format;
    }

    // Number constraints
    if (param.minimum !== undefined) {
      property.minimum = param.minimum;
    }
    if (param.maximum !== undefined) {
      property.maximum = param.maximum;
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

function generateToolManifest(tool: MCPTool): Record<string, any> {
  const manifest: Record<string, any> = {
    name: tool.name.toLowerCase().replace(/\s+/g, '_'),
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

export function generateManifest(config: MCPServerConfig): Record<string, any> {
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
