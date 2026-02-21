import { MCPServerConfig, MCPParameter } from '../types';

function generateJsonSchema(parameters: MCPParameter[]): Record<string, any> {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  parameters.forEach((param) => {
    properties[param.name] = {
      type: param.type,
      description: param.description,
    };
    
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

export function generateManifest(config: MCPServerConfig): Record<string, any> {
  return {
    name: config.name,
    version: config.version,
    tools: config.tools.map((tool) => ({
      name: tool.name.toLowerCase().replace(/\s+/g, '_'),
      description: tool.description,
      icon: tool.icon,
      inputSchema: generateJsonSchema(tool.parameters),
    })),
  };
}
