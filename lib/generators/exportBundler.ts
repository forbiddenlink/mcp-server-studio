import { MCPServerConfig } from '../types';
import { generateMCPServer } from './mcpServerGenerator';
import { generateDockerFiles } from './dockerGenerator';
import { generateRailwayFiles, generateRailwayInstructions } from './railwayGenerator';
import { generateClaudeDesktopConfig, generatePackageJson, generateTsConfig } from './readmeGenerator';
import { generateV0Bundle } from './v0Generator';

export type ExportFormat = 'typescript' | 'docker' | 'railway' | 'v0';

export interface ExportFile {
  name: string;
  content: string;
}

export interface ExportBundle {
  filename: string;
  mimeType: string;
  files: ExportFile[];
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

  if (format === 'v0') {
    const v0Bundle = generateV0Bundle(config);
    const dockerFiles = generateDockerFiles(config);
    return {
      filename: `${safeName}-v0.zip`,
      mimeType: 'application/zip',
      files: [
        ...baseFiles,
        ...Object.entries(dockerFiles).map(([name, content]) => ({
          name,
          content,
        })),
        { name: 'v0-config.json', content: JSON.stringify(v0Bundle.config, null, 2) },
        { name: 'v0-integration.ts', content: v0Bundle.integrationCode },
        { name: 'V0_QUICKSTART.md', content: v0Bundle.quickstart },
        { name: 'V0_DEPLOYMENT.md', content: v0Bundle.readme },
      ],
    };
  }

  throw new Error(`Unknown export format: ${format}`);
}
