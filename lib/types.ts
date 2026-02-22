// MCP Server Studio Types

export type ParameterType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export type StringFormat = 'email' | 'uri' | 'date' | 'uuid' | 'date-time';

export type TransportType = 'stdio' | 'http';

export interface MCPParameter {
  name: string;
  type: ParameterType;
  description: string;
  required: boolean;
  // String constraints
  enum?: string[];
  format?: StringFormat;
  // Number constraints
  minimum?: number;
  maximum?: number;
}

// Sampling configuration - allows tools to request LLM inference from clients
export interface SamplingConfig {
  enabled: boolean;
  maxTokens: number;        // Required, prevents runaway
  temperature?: number;     // 0-2, default 0.7
  systemPrompt?: string;
  modelHint?: 'fastest' | 'balanced' | 'smartest';
}

// Elicitation configuration - allows tools to request user input
export type ElicitationMode = 'form' | 'url';

export interface ElicitationFormField {
  name: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
  required: boolean;
}

export interface ElicitationConfig {
  enabled: boolean;
  mode: ElicitationMode;
  message: string;
  formFields?: ElicitationFormField[];  // Form mode
  url?: string;                          // URL mode
}

// Tasks configuration - for long-running async tools (experimental)
export interface TasksConfig {
  enabled: boolean;
  ttl?: number;  // milliseconds
}

export interface MCPTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  parameters: MCPParameter[];
  sampling?: SamplingConfig;
  elicitation?: ElicitationConfig;
  tasks?: TasksConfig;
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
