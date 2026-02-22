import { MCPServerConfig } from '../types';

/**
 * Generates a Dockerfile for the MCP server
 * Uses multi-stage build with Node 20 alpine for minimal image size
 */
export function generateDockerfile(config: MCPServerConfig): string {
  const port = config.httpPort || 3000;
  const isHttp = config.transport === 'http';

  return `# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source files
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S mcpuser && \\
    adduser -S mcpuser -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && \\
    npm cache clean --force

# Copy built files from builder stage
COPY --from=builder /app/build ./build

# Change ownership to non-root user
RUN chown -R mcpuser:mcpuser /app

# Switch to non-root user
USER mcpuser

${isHttp ? `# Expose HTTP port
EXPOSE ${port}

# Set environment variables
ENV NODE_ENV=production
ENV PORT=${port}

# Health check for HTTP transport
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:${port}/health || exit 1

` : `# Set environment variables
ENV NODE_ENV=production

`}# Start the server
CMD ["node", "build/index.js"]
`;
}

/**
 * Generates a .dockerignore file
 */
export function generateDockerIgnore(): string {
  return `# Dependencies
node_modules/
npm-debug.log*

# Build output (we rebuild in container)
build/
dist/

# Development files
.git/
.gitignore
.env
.env.*
*.md
!README.md

# IDE and editor files
.idea/
.vscode/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Test files
__tests__/
*.test.ts
*.spec.ts
coverage/
.nyc_output/

# Docker files (prevent recursive copy)
Dockerfile*
docker-compose*.yml
.dockerignore
`;
}

/**
 * Generates a docker-compose.yml for local development
 */
export function generateDockerCompose(config: MCPServerConfig): string {
  const port = config.httpPort || 3000;
  const isHttp = config.transport === 'http';
  const serviceName = config.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

  if (!isHttp) {
    // For stdio transport, docker-compose is less useful but we can still provide it
    return `# Docker Compose for ${config.name}
# Note: stdio transport servers typically run directly, not via docker-compose

version: "3.8"

services:
  ${serviceName}:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ${serviceName}
    stdin_open: true
    tty: true
    restart: unless-stopped
`;
  }

  return `# Docker Compose for ${config.name}
# Run: docker-compose up -d

version: "3.8"

services:
  ${serviceName}:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ${serviceName}
    ports:
      - "${port}:${port}"
    environment:
      - NODE_ENV=production
      - PORT=${port}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:${port}/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s

# Uncomment to add volume mounts for persistence
#    volumes:
#      - ./data:/app/data
`;
}

/**
 * Generates all Docker-related files as a record
 */
export function generateDockerFiles(config: MCPServerConfig): Record<string, string> {
  return {
    'Dockerfile': generateDockerfile(config),
    '.dockerignore': generateDockerIgnore(),
    'docker-compose.yml': generateDockerCompose(config),
  };
}
