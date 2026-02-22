import { describe, it, expect } from 'vitest';
import {
  generateRailwayJson,
  generateRailwayToml,
  generateRailwayEnv,
  generateRailwayFiles,
  generateRailwayInstructions,
} from '../railwayGenerator';
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

describe('railwayGenerator', () => {
  describe('generateRailwayJson', () => {
    it('generates valid JSON for stdio transport', () => {
      const config = createTestConfig({ transport: 'stdio' });
      const result = generateRailwayJson(config);
      const parsed = JSON.parse(result);

      expect(parsed.$schema).toBe('https://railway.app/railway.schema.json');
      expect(parsed.build.builder).toBe('NIXPACKS');
      expect(parsed.build.buildCommand).toBe('npm run build');
      expect(parsed.deploy.startCommand).toBe('node build/index.js');
      expect(parsed.deploy.healthcheckPath).toBeUndefined();
    });

    it('includes health check for HTTP transport', () => {
      const config = createTestConfig({ transport: 'http', httpPort: 8080 });
      const result = generateRailwayJson(config);
      const parsed = JSON.parse(result);

      expect(parsed.deploy.healthcheckPath).toBe('/health');
      expect(parsed.deploy.healthcheckTimeout).toBe(30);
    });
  });

  describe('generateRailwayToml', () => {
    it('generates valid TOML for stdio transport', () => {
      const config = createTestConfig({ transport: 'stdio' });
      const result = generateRailwayToml(config);

      expect(result).toContain('builder = "NIXPACKS"');
      expect(result).toContain('buildCommand = "npm run build"');
      expect(result).toContain('startCommand = "node build/index.js"');
      expect(result).not.toContain('healthcheckPath');
    });

    it('includes health check for HTTP transport', () => {
      const config = createTestConfig({ transport: 'http', httpPort: 3000 });
      const result = generateRailwayToml(config);

      expect(result).toContain('healthcheckPath = "/health"');
      expect(result).toContain('healthcheckTimeout = 30');
    });
  });

  describe('generateRailwayEnv', () => {
    it('generates environment template for stdio', () => {
      const config = createTestConfig({ transport: 'stdio' });
      const result = generateRailwayEnv(config);

      expect(result).toContain('NODE_ENV=production');
      expect(result).not.toContain('PORT=');
    });

    it('includes PORT for HTTP transport', () => {
      const config = createTestConfig({ transport: 'http', httpPort: 8080 });
      const result = generateRailwayEnv(config);

      expect(result).toContain('NODE_ENV=production');
      expect(result).toContain('PORT=8080');
    });
  });

  describe('generateRailwayFiles', () => {
    it('generates all three Railway files', () => {
      const config = createTestConfig();
      const files = generateRailwayFiles(config);

      expect(Object.keys(files)).toEqual(['railway.json', 'railway.toml', '.env.railway']);
      expect(files['railway.json']).toBeTruthy();
      expect(files['railway.toml']).toBeTruthy();
      expect(files['.env.railway']).toBeTruthy();
    });
  });

  describe('generateRailwayInstructions', () => {
    it('generates deployment instructions', () => {
      const config = createTestConfig();
      const result = generateRailwayInstructions(config);

      expect(result).toContain('railway init');
      expect(result).toContain('railway up');
      expect(result).toContain('railway logs');
    });

    it('includes port setup for HTTP transport', () => {
      const config = createTestConfig({ transport: 'http', httpPort: 3000 });
      const result = generateRailwayInstructions(config);

      expect(result).toContain('railway variables set PORT=3000');
    });
  });
});
