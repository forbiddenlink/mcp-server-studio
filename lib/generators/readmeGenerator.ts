import { MCPServerConfig, MCPTool, MCPParameter, MCPResource, MCPPrompt } from '../types';

/**
 * Converts a name to snake_case for identifiers
 */
function toSnakeCase(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

/**
 * Generates constraint documentation for a parameter
 */
function generateConstraintDocs(p: MCPParameter): string {
  const constraints: string[] = [];

  // Default value
  if (p.default !== undefined) {
    const defaultStr = typeof p.default === 'string' ? p.default : JSON.stringify(p.default);
    constraints.push(`Default: \`${defaultStr}\``);
  }

  // Enum values
  if (p.enum && p.enum.length > 0) {
    const values = p.enum.map(v => `\`${v}\``).join(', ');
    constraints.push(`Allowed values: ${values}`);
  }

  // String format
  if (p.format) {
    constraints.push(`Format: ${p.format}`);
  }

  // String length constraints
  if (p.minLength !== undefined && p.maxLength !== undefined) {
    constraints.push(`Length: ${p.minLength}-${p.maxLength}`);
  } else if (p.minLength !== undefined) {
    constraints.push(`Min length: ${p.minLength}`);
  } else if (p.maxLength !== undefined) {
    constraints.push(`Max length: ${p.maxLength}`);
  }

  // String pattern
  if (p.pattern) {
    constraints.push(`Pattern: \`${p.pattern}\``);
  }

  // Number range
  if (p.minimum !== undefined && p.maximum !== undefined) {
    constraints.push(`Range: ${p.minimum}-${p.maximum}`);
  } else if (p.minimum !== undefined) {
    constraints.push(`Min: ${p.minimum}`);
  } else if (p.maximum !== undefined) {
    constraints.push(`Max: ${p.maximum}`);
  }

  // Array items constraints
  if (p.minItems !== undefined && p.maxItems !== undefined) {
    constraints.push(`Items: ${p.minItems}-${p.maxItems}`);
  } else if (p.minItems !== undefined) {
    constraints.push(`Min items: ${p.minItems}`);
  } else if (p.maxItems !== undefined) {
    constraints.push(`Max items: ${p.maxItems}`);
  }

  // Unique items
  if (p.uniqueItems) {
    constraints.push(`Unique items required`);
  }

  return constraints.length > 0 ? ` (${constraints.join(', ')})` : '';
}

/**
 * Generates parameter documentation for a tool or prompt
 */
function generateParameterDocs(parameters: MCPParameter[]): string {
  if (parameters.length === 0) {
    return '*No parameters*';
  }

  return parameters
    .map(p => {
      const requiredTag = p.required ? '**required**' : '*optional*';
      const constraintDocs = generateConstraintDocs(p);
      return `- \`${p.name}\` (${p.type}, ${requiredTag}): ${p.description}${constraintDocs}`;
    })
    .join('\n');
}

/**
 * Generates Docker documentation section
 */
function generateDockerDocs(config: MCPServerConfig): string {
  const port = config.httpPort || 3000;
  const isHttp = config.transport === 'http';
  const imageName = config.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

  const dockerBuildRun = isHttp
    ? `\`\`\`bash
# Build the Docker image
docker build -t ${imageName} .

# Run the container
docker run -d -p ${port}:${port} --name ${imageName} ${imageName}

# Check health
curl http://localhost:${port}/health

# View logs
docker logs -f ${imageName}

# Stop the container
docker stop ${imageName}
\`\`\``
    : `\`\`\`bash
# Build the Docker image
docker build -t ${imageName} .

# Run interactively (stdio transport)
docker run -it --rm ${imageName}
\`\`\``;

  const dockerCompose = isHttp
    ? `Or use Docker Compose:

\`\`\`bash
# Start the server
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the server
docker-compose down
\`\`\``
    : '';

  return `## Docker

${dockerBuildRun}

${dockerCompose}

### Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

To deploy to Railway:

1. Push your code to a GitHub repository
2. Connect your repo to Railway
3. Railway will automatically detect the Dockerfile and deploy
${isHttp ? `4. Your server will be available at the provided Railway URL` : ''}
`;
}

/**
 * Generates README.md content for the MCP server
 */
export function generateReadme(config: MCPServerConfig): string {
  const toolDocs = (config.tools || [])
    .map(tool => {
      const toolId = toSnakeCase(tool.name);
      return `### ${tool.icon} ${tool.name}

**ID:** \`${toolId}\`

${tool.description}

**Parameters:**
${generateParameterDocs(tool.parameters)}
`;
    })
    .join('\n');

  const resourceDocs = (config.resources || [])
    .map(resource => {
      return `### ${resource.name}

**URI:** \`${resource.uri}\`
**MIME Type:** \`${resource.mimeType}\`

${resource.description}
`;
    })
    .join('\n');

  const promptDocs = (config.prompts || [])
    .map(prompt => {
      const promptId = toSnakeCase(prompt.name);
      return `### ${prompt.name}

**ID:** \`${promptId}\`

${prompt.description}

**Arguments:**
${generateParameterDocs(prompt.arguments)}
`;
    })
    .join('\n');

  const hasTools = (config.tools || []).length > 0;
  const hasResources = (config.resources || []).length > 0;
  const hasPrompts = (config.prompts || []).length > 0;
  const isHttp = config.transport === 'http';
  const port = config.httpPort || 3000;

  // Transport-specific configuration
  const configSection = isHttp
    ? `## Configuration

This server uses HTTP/SSE transport and runs on port ${port}.

For Claude Desktop, add to your \`claude_desktop_config.json\`:

\`\`\`json
{
  "mcpServers": {
    "${config.name}": {
      "url": "http://localhost:${port}/sse"
    }
  }
}
\`\`\`

Or connect from any MCP client using the SSE endpoint:
- SSE Endpoint: \`http://localhost:${port}/sse\`
- Health Check: \`http://localhost:${port}/health\``
    : `## Configuration

Add to your \`claude_desktop_config.json\`:

\`\`\`json
{
  "mcpServers": {
    "${config.name}": {
      "command": "node",
      "args": ["${process.cwd()}/build/index.js"]
    }
  }
}
\`\`\`

Or for development:

\`\`\`json
{
  "mcpServers": {
    "${config.name}": {
      "command": "npx",
      "args": ["tsx", "${process.cwd()}/src/index.ts"]
    }
  }
}
\`\`\``;

  return `# ${config.name}

> MCP Server v${config.version} | Transport: ${config.transport || 'stdio'}

Generated by [MCP Server Studio](https://mcp-server-studio.vercel.app)

## Installation

\`\`\`bash
npm install
npm run build
\`\`\`

${configSection}

${hasTools ? `## Available Tools

${toolDocs}` : ''}

${hasResources ? `## Available Resources

${resourceDocs}` : ''}

${hasPrompts ? `## Available Prompts

${promptDocs}` : ''}

## Development

\`\`\`bash
# Watch mode for development
npm run dev

# Build for production
npm run build

# Run the server
npm start
\`\`\`

## Testing

Use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) to test your server:

\`\`\`bash
npx @modelcontextprotocol/inspector node build/index.js
\`\`\`

${generateDockerDocs(config)}

## License

MIT
`;
}

/**
 * Generates the claude_desktop_config.json snippet
 */
export function generateClaudeDesktopConfig(config: MCPServerConfig): string {
  const configObj = {
    mcpServers: {
      [config.name]: {
        command: 'node',
        args: ['./build/index.js'],
      },
    },
  };

  return JSON.stringify(configObj, null, 2);
}

/**
 * Generates package.json for the MCP server
 */
export function generatePackageJson(config: MCPServerConfig): string {
  const isHttp = config.transport === 'http';

  // Base dependencies
  const dependencies: Record<string, string> = {
    '@modelcontextprotocol/sdk': '^1.2.0',
    zod: '^3.24.0',
  };

  // Base devDependencies
  const devDependencies: Record<string, string> = {
    '@types/node': '^20.17.0',
    typescript: '^5.7.0',
    tsx: '^4.19.0',
    eslint: '^9.0.0',
  };

  // Add HTTP transport dependencies
  if (isHttp) {
    dependencies['express'] = '^4.21.0';
    dependencies['cors'] = '^2.8.5';
    devDependencies['@types/express'] = '^4.17.21';
    devDependencies['@types/cors'] = '^2.8.17';
  }

  const packageObj = {
    name: config.name,
    version: config.version,
    description: `MCP Server: ${config.name}`,
    type: 'module',
    main: './build/index.js',
    bin: {
      [config.name]: './build/index.js',
    },
    scripts: {
      build: 'tsc && chmod +x build/index.js',
      start: 'node build/index.js',
      dev: 'tsx watch src/index.ts',
      lint: 'eslint src/',
      test: 'node --test',
    },
    dependencies,
    devDependencies,
    engines: {
      node: '>=18.0.0',
    },
    keywords: ['mcp', 'model-context-protocol', 'ai', 'llm'],
    license: 'MIT',
  };

  return JSON.stringify(packageObj, null, 2);
}

/**
 * Generates tsconfig.json for the MCP server
 */
export function generateTsConfig(): string {
  const tsconfigObj = {
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      outDir: './build',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'build'],
  };

  return JSON.stringify(tsconfigObj, null, 2);
}

/**
 * Generates all project files as a record
 */
export function generateProjectFiles(config: MCPServerConfig): Record<string, string> {
  return {
    'README.md': generateReadme(config),
    'package.json': generatePackageJson(config),
    'tsconfig.json': generateTsConfig(),
    'claude_desktop_config.json': generateClaudeDesktopConfig(config),
  };
}
