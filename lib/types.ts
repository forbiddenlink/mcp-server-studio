// MCP Server Studio Types

export type ParameterType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface MCPParameter {
  name: string;
  type: ParameterType;
  description: string;
  required: boolean;
}

export interface MCPTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  parameters: MCPParameter[];
}

export interface MCPServerConfig {
  name: string;
  version: string;
  tools: MCPTool[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCall?: {
    toolName: string;
    parameters: Record<string, unknown>;
  };
  timestamp: number;
}

export interface ToolTemplate {
  name: string;
  description: string;
  icon: string;
  defaultParameters: MCPParameter[];
}
