import { ToolTemplate } from '../types';

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: ToolTemplate[];
}

// Data & APIs Category
const dataApiTemplates: ToolTemplate[] = [
  {
    name: 'Web Search',
    description: 'Search the web for information',
    icon: 'Search',
    defaultParameters: [
      {
        name: 'query',
        type: 'string',
        description: 'Search query',
        required: true,
      },
    ],
  },
  {
    name: 'API Call',
    description: 'Make an HTTP API request',
    icon: 'Globe',
    defaultParameters: [
      {
        name: 'url',
        type: 'string',
        description: 'API endpoint URL',
        required: true,
      },
      {
        name: 'method',
        type: 'string',
        description: 'HTTP method (GET, POST, etc.)',
        required: false,
      },
      {
        name: 'body',
        type: 'object',
        description: 'Request body',
        required: false,
      },
    ],
  },
  {
    name: 'Database Query',
    description: 'Execute a database query',
    icon: 'Database',
    defaultParameters: [
      {
        name: 'sql',
        type: 'string',
        description: 'SQL query to execute',
        required: true,
      },
    ],
  },
  {
    name: 'GraphQL Query',
    description: 'Execute a GraphQL query',
    icon: 'Braces',
    defaultParameters: [
      {
        name: 'endpoint',
        type: 'string',
        description: 'GraphQL endpoint URL',
        required: true,
      },
      {
        name: 'query',
        type: 'string',
        description: 'GraphQL query string',
        required: true,
      },
      {
        name: 'variables',
        type: 'object',
        description: 'Query variables',
        required: false,
      },
    ],
  },
];

// File Operations Category
const fileTemplates: ToolTemplate[] = [
  {
    name: 'File Read',
    description: 'Read contents of a file',
    icon: 'FileText',
    defaultParameters: [
      {
        name: 'path',
        type: 'string',
        description: 'File path to read',
        required: true,
      },
    ],
  },
  {
    name: 'Create File',
    description: 'Create a new file',
    icon: 'FilePlus',
    defaultParameters: [
      {
        name: 'path',
        type: 'string',
        description: 'File path',
        required: true,
      },
      {
        name: 'content',
        type: 'string',
        description: 'File content',
        required: true,
      },
    ],
  },
  {
    name: 'File Delete',
    description: 'Delete a file or directory',
    icon: 'Trash2',
    defaultParameters: [
      {
        name: 'path',
        type: 'string',
        description: 'File or directory path to delete',
        required: true,
      },
      {
        name: 'recursive',
        type: 'boolean',
        description: 'Delete directories recursively',
        required: false,
      },
    ],
  },
  {
    name: 'File Move',
    description: 'Move or rename a file',
    icon: 'FolderInput',
    defaultParameters: [
      {
        name: 'source',
        type: 'string',
        description: 'Source file path',
        required: true,
      },
      {
        name: 'destination',
        type: 'string',
        description: 'Destination file path',
        required: true,
      },
    ],
  },
];

// Communication Category
const communicationTemplates: ToolTemplate[] = [
  {
    name: 'Send Email',
    description: 'Send an email message',
    icon: 'Mail',
    defaultParameters: [
      {
        name: 'to',
        type: 'string',
        description: 'Recipient email address',
        required: true,
      },
      {
        name: 'subject',
        type: 'string',
        description: 'Email subject',
        required: true,
      },
      {
        name: 'body',
        type: 'string',
        description: 'Email body content',
        required: true,
      },
    ],
  },
  {
    name: 'Slack Message',
    description: 'Send a message to a Slack channel',
    icon: 'MessageSquare',
    defaultParameters: [
      {
        name: 'channel',
        type: 'string',
        description: 'Slack channel (e.g., #general)',
        required: true,
      },
      {
        name: 'message',
        type: 'string',
        description: 'Message content',
        required: true,
      },
      {
        name: 'thread_ts',
        type: 'string',
        description: 'Thread timestamp for replies',
        required: false,
      },
    ],
  },
  {
    name: 'Discord Message',
    description: 'Send a message to Discord',
    icon: 'MessageCircle',
    defaultParameters: [
      {
        name: 'webhook_url',
        type: 'string',
        description: 'Discord webhook URL',
        required: true,
      },
      {
        name: 'content',
        type: 'string',
        description: 'Message content',
        required: true,
      },
    ],
  },
  {
    name: 'SMS Send',
    description: 'Send an SMS text message',
    icon: 'Smartphone',
    defaultParameters: [
      {
        name: 'to',
        type: 'string',
        description: 'Phone number',
        required: true,
      },
      {
        name: 'message',
        type: 'string',
        description: 'SMS message content',
        required: true,
      },
    ],
  },
];

// System Category
const systemTemplates: ToolTemplate[] = [
  {
    name: 'Run Command',
    description: 'Execute a shell command',
    icon: 'Terminal',
    defaultParameters: [
      {
        name: 'command',
        type: 'string',
        description: 'Command to execute',
        required: true,
      },
    ],
  },
  {
    name: 'Execute Code',
    description: 'Execute code in a sandboxed environment',
    icon: 'Code',
    defaultParameters: [
      {
        name: 'language',
        type: 'string',
        description: 'Programming language (python, javascript, etc.)',
        required: true,
      },
      {
        name: 'code',
        type: 'string',
        description: 'Code to execute',
        required: true,
      },
    ],
  },
  {
    name: 'Environment Variable',
    description: 'Get or set environment variables',
    icon: 'Key',
    defaultParameters: [
      {
        name: 'action',
        type: 'string',
        description: 'Action: get or set',
        required: true,
      },
      {
        name: 'name',
        type: 'string',
        description: 'Variable name',
        required: true,
      },
      {
        name: 'value',
        type: 'string',
        description: 'Variable value (for set)',
        required: false,
      },
    ],
  },
];

// Developer Tools Category
const developerTemplates: ToolTemplate[] = [
  {
    name: 'Git Operations',
    description: 'Perform Git operations on a repository',
    icon: 'GitBranch',
    defaultParameters: [
      {
        name: 'operation',
        type: 'string',
        description: 'Git operation (clone, pull, push, commit, etc.)',
        required: true,
      },
      {
        name: 'repo_path',
        type: 'string',
        description: 'Path to the repository',
        required: true,
      },
      {
        name: 'message',
        type: 'string',
        description: 'Commit message (for commit operations)',
        required: false,
      },
    ],
  },
  {
    name: 'GitHub Issue',
    description: 'Create or manage GitHub issues',
    icon: 'CircleDot',
    defaultParameters: [
      {
        name: 'action',
        type: 'string',
        description: 'Action: create, update, close, list',
        required: true,
      },
      {
        name: 'repo',
        type: 'string',
        description: 'Repository (owner/repo)',
        required: true,
      },
      {
        name: 'title',
        type: 'string',
        description: 'Issue title',
        required: false,
      },
      {
        name: 'body',
        type: 'string',
        description: 'Issue body/description',
        required: false,
      },
    ],
  },
  {
    name: 'GitHub PR',
    description: 'Create or manage pull requests',
    icon: 'GitPullRequest',
    defaultParameters: [
      {
        name: 'action',
        type: 'string',
        description: 'Action: create, merge, list',
        required: true,
      },
      {
        name: 'repo',
        type: 'string',
        description: 'Repository (owner/repo)',
        required: true,
      },
      {
        name: 'title',
        type: 'string',
        description: 'PR title',
        required: false,
      },
      {
        name: 'base',
        type: 'string',
        description: 'Base branch',
        required: false,
      },
      {
        name: 'head',
        type: 'string',
        description: 'Head branch',
        required: false,
      },
    ],
  },
];

// AI & ML Category
const aiTemplates: ToolTemplate[] = [
  {
    name: 'Image Generation',
    description: 'Generate an image from a text prompt',
    icon: 'Image',
    defaultParameters: [
      {
        name: 'prompt',
        type: 'string',
        description: 'Text description of the image to generate',
        required: true,
      },
      {
        name: 'size',
        type: 'string',
        description: 'Image size (e.g., 1024x1024)',
        required: false,
      },
      {
        name: 'style',
        type: 'string',
        description: 'Image style (realistic, cartoon, etc.)',
        required: false,
      },
    ],
  },
  {
    name: 'Text Translation',
    description: 'Translate text between languages',
    icon: 'Languages',
    defaultParameters: [
      {
        name: 'text',
        type: 'string',
        description: 'Text to translate',
        required: true,
      },
      {
        name: 'target_language',
        type: 'string',
        description: 'Target language code (e.g., es, fr, de)',
        required: true,
      },
      {
        name: 'source_language',
        type: 'string',
        description: 'Source language code (auto-detect if not specified)',
        required: false,
      },
    ],
  },
  {
    name: 'Text to Speech',
    description: 'Convert text to audio speech',
    icon: 'Volume2',
    defaultParameters: [
      {
        name: 'text',
        type: 'string',
        description: 'Text to convert to speech',
        required: true,
      },
      {
        name: 'voice',
        type: 'string',
        description: 'Voice ID or name',
        required: false,
      },
      {
        name: 'language',
        type: 'string',
        description: 'Language code',
        required: false,
      },
    ],
  },
  {
    name: 'Speech to Text',
    description: 'Transcribe audio to text',
    icon: 'Mic',
    defaultParameters: [
      {
        name: 'audio_url',
        type: 'string',
        description: 'URL to audio file',
        required: true,
      },
      {
        name: 'language',
        type: 'string',
        description: 'Expected language code',
        required: false,
      },
    ],
  },
  {
    name: 'Sentiment Analysis',
    description: 'Analyze sentiment of text',
    icon: 'Heart',
    defaultParameters: [
      {
        name: 'text',
        type: 'string',
        description: 'Text to analyze',
        required: true,
      },
    ],
  },
];

// Utilities Category
const utilityTemplates: ToolTemplate[] = [
  {
    name: 'Get Weather',
    description: 'Get weather information',
    icon: 'Cloud',
    defaultParameters: [
      {
        name: 'location',
        type: 'string',
        description: 'Location (city, zip code, etc.)',
        required: true,
      },
    ],
  },
  {
    name: 'Calculate',
    description: 'Perform mathematical calculations',
    icon: 'Calculator',
    defaultParameters: [
      {
        name: 'expression',
        type: 'string',
        description: 'Mathematical expression to evaluate',
        required: true,
      },
    ],
  },
  {
    name: 'Calendar Event',
    description: 'Create or manage calendar events',
    icon: 'Calendar',
    defaultParameters: [
      {
        name: 'action',
        type: 'string',
        description: 'Action to perform (create, update, delete, list)',
        required: true,
      },
      {
        name: 'title',
        type: 'string',
        description: 'Event title',
        required: false,
      },
      {
        name: 'start_time',
        type: 'string',
        description: 'Event start time (ISO 8601)',
        required: false,
      },
      {
        name: 'end_time',
        type: 'string',
        description: 'Event end time (ISO 8601)',
        required: false,
      },
    ],
  },
  {
    name: 'Take Screenshot',
    description: 'Capture a screenshot of a URL or screen',
    icon: 'Camera',
    defaultParameters: [
      {
        name: 'url',
        type: 'string',
        description: 'URL to screenshot',
        required: true,
      },
      {
        name: 'full_page',
        type: 'boolean',
        description: 'Capture full page scroll',
        required: false,
      },
    ],
  },
  {
    name: 'QR Code Generate',
    description: 'Generate a QR code',
    icon: 'QrCode',
    defaultParameters: [
      {
        name: 'data',
        type: 'string',
        description: 'Data to encode in QR code',
        required: true,
      },
      {
        name: 'size',
        type: 'number',
        description: 'Size of the QR code in pixels',
        required: false,
      },
    ],
  },
  {
    name: 'URL Shortener',
    description: 'Shorten a long URL',
    icon: 'Link',
    defaultParameters: [
      {
        name: 'url',
        type: 'string',
        description: 'URL to shorten',
        required: true,
      },
    ],
  },
];

// Export all categories
export const templateCategories: TemplateCategory[] = [
  {
    id: 'data-apis',
    name: 'Data & APIs',
    description: 'Web search, API calls, and database operations',
    icon: 'Globe',
    templates: dataApiTemplates,
  },
  {
    id: 'file-ops',
    name: 'File Operations',
    description: 'Read, write, move, and delete files',
    icon: 'FolderOpen',
    templates: fileTemplates,
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'Email, Slack, Discord, and SMS messaging',
    icon: 'Send',
    templates: communicationTemplates,
  },
  {
    id: 'system',
    name: 'System',
    description: 'Shell commands and code execution',
    icon: 'Terminal',
    templates: systemTemplates,
  },
  {
    id: 'developer',
    name: 'Developer Tools',
    description: 'Git, GitHub, and development utilities',
    icon: 'GitBranch',
    templates: developerTemplates,
  },
  {
    id: 'ai-ml',
    name: 'AI & ML',
    description: 'Image generation, translation, and NLP',
    icon: 'Sparkles',
    templates: aiTemplates,
  },
  {
    id: 'utilities',
    name: 'Utilities',
    description: 'Weather, calculator, calendar, and more',
    icon: 'Wrench',
    templates: utilityTemplates,
  },
];

// Export all templates flat for backwards compatibility
export const allTemplates: ToolTemplate[] = templateCategories.flatMap(
  (category) => category.templates
);

// Helper function to find a template by name
export function findTemplateByName(name: string): ToolTemplate | undefined {
  return allTemplates.find((t) => t.name === name);
}

// Helper function to get templates by category ID
export function getTemplatesByCategory(categoryId: string): ToolTemplate[] {
  const category = templateCategories.find((c) => c.id === categoryId);
  return category?.templates || [];
}
