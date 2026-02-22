import { ToolTemplate } from '../types';

export const toolTemplates: ToolTemplate[] = [
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
    name: 'Generate Image',
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
    name: 'Send Notification',
    description: 'Send a notification message (Slack, Discord, etc.)',
    icon: 'MessageSquare',
    defaultParameters: [
      {
        name: 'channel',
        type: 'string',
        description: 'Channel or recipient',
        required: true,
      },
      {
        name: 'message',
        type: 'string',
        description: 'Message content',
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
    name: 'Translate Text',
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
];
