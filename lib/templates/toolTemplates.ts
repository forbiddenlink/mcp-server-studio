import { ToolTemplate } from '../types';

export const toolTemplates: ToolTemplate[] = [
  {
    name: 'Web Search',
    description: 'Search the web for information',
    icon: '🔍',
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
    icon: '📄',
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
    icon: '🌐',
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
    icon: '🗄️',
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
    icon: '✉️',
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
    icon: '📝',
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
    icon: '⚡',
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
    icon: '☁️',
    defaultParameters: [
      {
        name: 'location',
        type: 'string',
        description: 'Location (city, zip code, etc.)',
        required: true,
      },
    ],
  },
];
