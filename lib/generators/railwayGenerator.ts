import { MCPServerConfig } from '../types';

/**
 * Generates railway.json configuration for Railway deployment
 * https://docs.railway.app/reference/config-as-code
 */
export function generateRailwayJson(config: MCPServerConfig): string {
  const isHttp = config.transport === 'http';
  const port = config.httpPort || 3000;

  const railwayConfig: Record<string, unknown> = {
    $schema: 'https://railway.app/railway.schema.json',
    build: {
      builder: 'NIXPACKS',
      buildCommand: 'npm run build',
    },
    deploy: {
      startCommand: 'node build/index.js',
      healthcheckPath: isHttp ? '/health' : undefined,
      healthcheckTimeout: isHttp ? 30 : undefined,
      restartPolicyType: 'ON_FAILURE',
      restartPolicyMaxRetries: 3,
    },
  };

  // Clean up undefined values
  if (!isHttp) {
    delete railwayConfig.deploy;
    railwayConfig.deploy = {
      startCommand: 'node build/index.js',
      restartPolicyType: 'ON_FAILURE',
      restartPolicyMaxRetries: 3,
    };
  }

  return JSON.stringify(railwayConfig, null, 2);
}

/**
 * Generates railway.toml configuration (alternative format)
 */
export function generateRailwayToml(config: MCPServerConfig): string {
  const isHttp = config.transport === 'http';
  const port = config.httpPort || 3000;

  let toml = `# Railway Configuration for ${config.name}
# https://docs.railway.app/reference/config-as-code

[build]
builder = "NIXPACKS"
buildCommand = "npm run build"

[deploy]
startCommand = "node build/index.js"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
`;

  if (isHttp) {
    toml += `healthcheckPath = "/health"
healthcheckTimeout = 30
`;
  }

  return toml;
}

/**
 * Generates environment variables template for Railway
 */
export function generateRailwayEnv(config: MCPServerConfig): string {
  const isHttp = config.transport === 'http';
  const port = config.httpPort || 3000;

  let env = `# Railway Environment Variables for ${config.name}
# Add these in the Railway dashboard or via CLI

NODE_ENV=production
`;

  if (isHttp) {
    env += `PORT=${port}
`;
  }

  env += `
# Add your custom environment variables below:
# API_KEY=your-api-key
# DATABASE_URL=your-database-url
`;

  return env;
}

/**
 * Generates all Railway-related files
 */
export function generateRailwayFiles(config: MCPServerConfig): Record<string, string> {
  return {
    'railway.json': generateRailwayJson(config),
    'railway.toml': generateRailwayToml(config),
    '.env.railway': generateRailwayEnv(config),
  };
}

/**
 * Generates CLI commands for Railway deployment
 */
export function generateRailwayInstructions(config: MCPServerConfig): string {
  const isHttp = config.transport === 'http';

  return `# Deploy ${config.name} to Railway

## Prerequisites
1. Install Railway CLI: \`npm install -g @railway/cli\`
2. Login: \`railway login\`

## Quick Deploy
\`\`\`bash
# Initialize new project (first time only)
railway init

# Deploy
railway up
\`\`\`

## With Environment Variables
\`\`\`bash
# Set variables
railway variables set NODE_ENV=production
${isHttp ? `railway variables set PORT=${config.httpPort || 3000}` : ''}

# Deploy
railway up
\`\`\`

## Generate Domain${isHttp ? '' : ' (HTTP transport only)'}
\`\`\`bash
railway domain
\`\`\`

## View Logs
\`\`\`bash
railway logs
\`\`\`

## Open Dashboard
\`\`\`bash
railway open
\`\`\`
`;
}
