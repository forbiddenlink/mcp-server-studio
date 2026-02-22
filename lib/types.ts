// MCP Server Studio Types

export type ParameterType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export type TransportType = 'stdio' | 'http';

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
  transport: TransportType;
  httpPort: number;
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
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

export interface MCPResource {
  id: string;
  name: string;
  description: string;
  uri: string;  // e.g., "file://README.md", "db://users/schema"
  mimeType: string;  // e.g., "text/plain", "application/json"
}

export interface MCPPrompt {
  id: string;
  name: string;
  description: string;
  arguments: MCPParameter[];  // reuse MCPParameter for prompt args
}
