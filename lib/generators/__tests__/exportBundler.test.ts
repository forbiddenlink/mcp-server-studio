import { describe, it, expect } from 'vitest';
import {
  createExportBundle,
  ExportFormat,
} from '../exportBundler';
import { MCPServerConfig } from '../../types';

const createTestConfig = (overrides: Partial<MCPServerConfig> = {}): MCPServerConfig => ({
  name: 'test-server',
  version: '1.0.0',
  transport: 'stdio',
  httpPort: 3000,
  tools: [],
  resources: [],
  prompts: [],
  ...overrides,
});

describe('exportBundler', () => {
  describe('createExportBundle', () => {
    it('creates TypeScript-only export when format is typescript', () => {
      const config = createTestConfig();
      const bundle = createExportBundle(config, 'typescript');

      expect(bundle.filename).toBe('test-server.ts');
      expect(bundle.mimeType).toBe('text/typescript');
      expect(bundle.files).toHaveLength(1);
      expect(bundle.files[0].name).toBe('index.ts');
    });

    it('creates Docker bundle with all Docker files', () => {
      const config = createTestConfig();
      const bundle = createExportBundle(config, 'docker');

      expect(bundle.filename).toBe('test-server-docker.zip');
      expect(bundle.mimeType).toBe('application/zip');
      expect(bundle.files.map(f => f.name)).toContain('Dockerfile');
      expect(bundle.files.map(f => f.name)).toContain('.dockerignore');
      expect(bundle.files.map(f => f.name)).toContain('docker-compose.yml');
      expect(bundle.files.map(f => f.name)).toContain('src/index.ts');
    });

    it('creates Railway bundle with Railway config files', () => {
      const config = createTestConfig();
      const bundle = createExportBundle(config, 'railway');

      expect(bundle.filename).toBe('test-server-railway.zip');
      expect(bundle.mimeType).toBe('application/zip');
      expect(bundle.files.map(f => f.name)).toContain('railway.json');
      expect(bundle.files.map(f => f.name)).toContain('railway.toml');
      expect(bundle.files.map(f => f.name)).toContain('.env.railway');
      expect(bundle.files.map(f => f.name)).toContain('src/index.ts');
      expect(bundle.files.map(f => f.name)).toContain('DEPLOY.md');
    });

    it('includes package.json in deployment bundles', () => {
      const config = createTestConfig();

      const dockerBundle = createExportBundle(config, 'docker');
      const railwayBundle = createExportBundle(config, 'railway');

      expect(dockerBundle.files.map(f => f.name)).toContain('package.json');
      expect(railwayBundle.files.map(f => f.name)).toContain('package.json');
    });

    it('includes tsconfig.json in deployment bundles', () => {
      const config = createTestConfig();

      const dockerBundle = createExportBundle(config, 'docker');
      const railwayBundle = createExportBundle(config, 'railway');

      expect(dockerBundle.files.map(f => f.name)).toContain('tsconfig.json');
      expect(railwayBundle.files.map(f => f.name)).toContain('tsconfig.json');
    });
  });
});
