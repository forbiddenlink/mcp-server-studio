import { MCPServerConfig } from '../types';
import { generateMCPServer } from './mcpServerGenerator';
import { generateDockerFiles } from './dockerGenerator';
import { generateRailwayFiles, generateRailwayInstructions } from './railwayGenerator';
import { generateClaudeDesktopConfig } from './readmeGenerator';

export type ExportFormat = 'typescript' | 'docker' | 'railway';

export interface ExportFile {
  name: string;
  content: string;
}

export interface ExportBundle {
  filename: string;
  mimeType: string;
  files: ExportFile[];
}

function generatePackageJson(config: MCPServerConfig): string {
  const packageJson = {
    name: config.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    version: config.version,
    description: `MCP server: ${config.name}`,
    type: 'module',
    main: 'build/index.js',
    scripts: {
      build: 'tsc',
      start: 'node build/index.js',
      dev: 'tsc --watch',
    },
    dependencies: {
      '@modelcontextprotocol/sdk': '^1.0.0',
      zod: '^3.22.0',
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      typescript: '^5.0.0',
    },
  };

  return JSON.stringify(packageJson, null, 2);
}

function generateTsConfig(): string {
  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      outDir: './build',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      declaration: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules'],
  };

  return JSON.stringify(tsconfig, null, 2);
}

export function createExportBundle(
  config: MCPServerConfig,
  format: ExportFormat
): ExportBundle {
  const serverCode = generateMCPServer(config);
  const safeName = config.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

  if (format === 'typescript') {
    return {
      filename: `${safeName}.ts`,
      mimeType: 'text/typescript',
      files: [{ name: 'index.ts', content: serverCode }],
    };
  }

  const baseFiles: ExportFile[] = [
    { name: 'src/index.ts', content: serverCode },
    { name: 'package.json', content: generatePackageJson(config) },
    { name: 'tsconfig.json', content: generateTsConfig() },
    { name: 'claude_desktop_config.json', content: generateClaudeDesktopConfig(config) },
  ];

  if (format === 'docker') {
    const dockerFiles = generateDockerFiles(config);
    return {
      filename: `${safeName}-docker.zip`,
      mimeType: 'application/zip',
      files: [
        ...baseFiles,
        ...Object.entries(dockerFiles).map(([name, content]) => ({
          name,
          content,
        })),
      ],
    };
  }

  if (format === 'railway') {
    const railwayFiles = generateRailwayFiles(config);
    const instructions = generateRailwayInstructions(config);
    return {
      filename: `${safeName}-railway.zip`,
      mimeType: 'application/zip',
      files: [
        ...baseFiles,
        ...Object.entries(railwayFiles).map(([name, content]) => ({
          name,
          content,
        })),
        { name: 'DEPLOY.md', content: instructions },
      ],
    };
  }

  throw new Error(`Unknown export format: ${format}`);
}
