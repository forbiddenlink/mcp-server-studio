import { MCPTool, MCPParameter } from '../types';

/**
 * AI Tool Generator - Uses pattern matching to parse natural language descriptions
 * into MCP tool definitions. No actual LLM calls - just smart heuristics!
 */

// Action verb patterns that indicate tool purpose
const actionPatterns = {
  search: ['search', 'find', 'look up', 'lookup', 'query', 'filter'],
  get: ['get', 'fetch', 'retrieve', 'read', 'load', 'pull'],
  create: ['create', 'add', 'insert', 'make', 'generate', 'new'],
  update: ['update', 'modify', 'edit', 'change', 'patch'],
  delete: ['delete', 'remove', 'clear', 'destroy', 'drop'],
  send: ['send', 'post', 'push', 'publish', 'broadcast', 'notify', 'email', 'message'],
  convert: ['convert', 'transform', 'translate', 'parse', 'format'],
  validate: ['validate', 'verify', 'check', 'test', 'confirm'],
  analyze: ['analyze', 'process', 'compute', 'calculate', 'evaluate'],
};

// Icon mapping based on tool category/domain
const iconPatterns: Record<string, string[]> = {
  Search: ['search', 'find', 'query', 'lookup'],
  Database: ['database', 'db', 'sql', 'record', 'table', 'user', 'profile', 'account'],
  Mail: ['email', 'mail', 'message', 'send', 'notify', 'notification'],
  Globe: ['url', 'web', 'http', 'api', 'fetch', 'request', 'endpoint'],
  FileText: ['file', 'document', 'text', 'content', 'read', 'write', 'log'],
  Code: ['code', 'script', 'execute', 'run', 'compile', 'parse'],
  Calculator: ['calculate', 'compute', 'math', 'number', 'convert', 'format'],
  Calendar: ['date', 'time', 'schedule', 'event', 'calendar', 'appointment'],
  Image: ['image', 'photo', 'picture', 'screenshot', 'resize', 'crop'],
  Cloud: ['cloud', 'upload', 'download', 'sync', 'backup', 'storage'],
  GitBranch: ['git', 'version', 'branch', 'commit', 'repository', 'repo'],
  Languages: ['translate', 'language', 'i18n', 'localize', 'locale'],
  Camera: ['camera', 'capture', 'record', 'video', 'stream'],
  Terminal: ['terminal', 'command', 'shell', 'cli', 'execute'],
};

// Parameter extraction patterns
const paramPatterns = [
  // "by X" pattern - e.g., "search users by email"
  { regex: /\bby\s+(\w+(?:\s+\w+)?)/gi, extractor: 'by' },
  // "with X" pattern - e.g., "create user with name and email"
  { regex: /\bwith\s+([\w\s,]+?)(?:\s+and\s+|\s*$)/gi, extractor: 'with' },
  // "given X" pattern - e.g., "given a URL"
  { regex: /\bgiven\s+(?:a|an|the)?\s*(\w+(?:\s+\w+)?)/gi, extractor: 'given' },
  // "using X" pattern - e.g., "using the API key"
  { regex: /\busing\s+(?:a|an|the)?\s*(\w+(?:\s+\w+)?)/gi, extractor: 'using' },
  // "from X" pattern - e.g., "from the database"
  { regex: /\bfrom\s+(?:a|an|the)?\s*(\w+)/gi, extractor: 'from' },
  // "to X" pattern for destinations - e.g., "send to email"
  { regex: /\bto\s+(?:a|an|the)?\s*(\w+(?:\s+address)?)/gi, extractor: 'to' },
  // "for X" pattern - e.g., "for user ID"
  { regex: /\bfor\s+(?:a|an|the)?\s*(\w+(?:\s+\w+)?)/gi, extractor: 'for' },
  // Explicit parameter mentions in quotes
  { regex: /"(\w+)"/g, extractor: 'quoted' },
];

// Type inference based on parameter name/context
function inferParameterType(name: string, context: string): 'string' | 'number' | 'boolean' | 'array' | 'object' {
  const lowerName = name.toLowerCase();
  const lowerContext = context.toLowerCase();

  // Number patterns
  if (/\b(id|count|limit|offset|page|size|amount|quantity|number|port|age|year|month|day)\b/.test(lowerName)) {
    return 'number';
  }

  // Boolean patterns
  if (/\b(is|has|should|enable|disable|active|valid|include|exclude|flag)\b/.test(lowerName)) {
    return 'boolean';
  }

  // Array patterns
  if (/\b(list|array|items|tags|ids|values|options|filters|fields)\b/.test(lowerName) || lowerName.endsWith('s')) {
    // Only infer array for plural words that suggest collections
    if (/\b(multiple|many|several|list|array)\b/.test(lowerContext)) {
      return 'array';
    }
  }

  // Object patterns
  if (/\b(config|options|settings|data|payload|body|metadata|properties)\b/.test(lowerName)) {
    return 'object';
  }

  // Default to string
  return 'string';
}

// Clean and normalize parameter name
function normalizeParamName(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// Extract action verb from description
function extractAction(description: string): { action: string; category: keyof typeof actionPatterns } | null {
  const lower = description.toLowerCase();

  for (const [category, verbs] of Object.entries(actionPatterns)) {
    for (const verb of verbs) {
      const regex = new RegExp(`\\b${verb}s?\\b`, 'i');
      if (regex.test(lower)) {
        return { action: verb, category: category as keyof typeof actionPatterns };
      }
    }
  }

  return null;
}

// Extract noun/object from description (what the tool operates on)
function extractObject(description: string): string | null {
  // Common patterns: "search [for] users", "get user", "create a document"
  const patterns = [
    /\b(?:search|find|get|fetch|create|update|delete|send)\s+(?:for\s+)?(?:a|an|the|all)?\s*(\w+)/i,
    /\b(\w+)\s+(?:search|lookup|finder|creator|manager)/i,
    /\b(?:user|users|email|document|file|record|message|data|profile|account|item|product|order|task|event)/i,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Select best icon based on description
function selectIcon(description: string): string {
  const lower = description.toLowerCase();

  for (const [icon, keywords] of Object.entries(iconPatterns)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return icon;
      }
    }
  }

  return 'Terminal'; // Default icon
}

// Extract parameters from description
function extractParameters(description: string): MCPParameter[] {
  const params: Map<string, MCPParameter> = new Map();

  for (const pattern of paramPatterns) {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);

    while ((match = regex.exec(description)) !== null) {
      const rawParams = match[1];

      // Split on "and", ",", "or" for multiple params
      const parts = rawParams.split(/\s*(?:,|and|or)\s*/);

      for (const part of parts) {
        const cleaned = part.trim();
        if (cleaned && cleaned.length > 1) {
          const name = normalizeParamName(cleaned);
          if (name && !params.has(name)) {
            params.set(name, {
              name,
              type: inferParameterType(name, description),
              description: `The ${cleaned} parameter`,
              required: pattern.extractor === 'by' || pattern.extractor === 'given',
            });
          }
        }
      }
    }
  }

  // If no parameters found, add smart defaults based on action type
  if (params.size === 0) {
    const action = extractAction(description);

    if (action) {
      switch (action.category) {
        case 'search':
        case 'get':
          params.set('query', {
            name: 'query',
            type: 'string',
            description: 'The search query or identifier',
            required: true,
          });
          break;
        case 'create':
        case 'update':
          params.set('data', {
            name: 'data',
            type: 'object',
            description: 'The data to create or update',
            required: true,
          });
          break;
        case 'delete':
          params.set('id', {
            name: 'id',
            type: 'string',
            description: 'The identifier of the item to delete',
            required: true,
          });
          break;
        case 'send':
          params.set('content', {
            name: 'content',
            type: 'string',
            description: 'The content to send',
            required: true,
          });
          params.set('destination', {
            name: 'destination',
            type: 'string',
            description: 'Where to send the content',
            required: true,
          });
          break;
      }
    }
  }

  return Array.from(params.values());
}

// Generate tool name from description
function generateToolName(description: string): string {
  const action = extractAction(description);
  const object = extractObject(description);

  if (action && object) {
    return `${action.action}_${object}`.toLowerCase().replace(/\s+/g, '_');
  }

  // Fallback: extract key words
  const words = description
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['the', 'and', 'for', 'that', 'with', 'from'].includes(w))
    .slice(0, 3);

  return words.join('_') || 'custom_tool';
}

// Generate description (clean up the original or create one)
function generateDescription(original: string): string {
  // Clean up the description
  let desc = original.trim();

  // Capitalize first letter
  desc = desc.charAt(0).toUpperCase() + desc.slice(1);

  // Add period if missing
  if (!desc.endsWith('.') && !desc.endsWith('!') && !desc.endsWith('?')) {
    desc += '.';
  }

  return desc;
}

/**
 * Parse a natural language description into an MCP Tool definition
 */
export function parseToolDescription(description: string): MCPTool {
  const name = generateToolName(description);
  const parameters = extractParameters(description);
  const icon = selectIcon(description);
  const toolDescription = generateDescription(description);

  return {
    id: `tool-${Date.now()}`,
    name,
    description: toolDescription,
    icon,
    parameters,
  };
}

/**
 * Validate a description and return suggestions for improvement
 */
export function analyzeDescription(description: string): {
  isValid: boolean;
  suggestions: string[];
  confidence: number;
} {
  const suggestions: string[] = [];
  let confidence = 0.5;

  // Check minimum length
  if (description.length < 10) {
    suggestions.push('Add more detail about what the tool should do.');
    confidence -= 0.2;
  }

  // Check for action verb
  const action = extractAction(description);
  if (action) {
    confidence += 0.2;
  } else {
    suggestions.push('Start with an action verb like "search", "create", "get", or "send".');
  }

  // Check for object/target
  const object = extractObject(description);
  if (object) {
    confidence += 0.1;
  } else {
    suggestions.push('Specify what the tool operates on (e.g., "users", "files", "messages").');
  }

  // Check for parameter hints
  const params = extractParameters(description);
  if (params.length > 0) {
    confidence += 0.15;
  } else {
    suggestions.push('Mention input parameters using "by", "with", or "given" (e.g., "by email", "with name and age").');
  }

  // Cap confidence
  confidence = Math.max(0.1, Math.min(1.0, confidence));

  return {
    isValid: description.length >= 5,
    suggestions,
    confidence,
  };
}
