import { describe, it, expect } from 'vitest';
import {
  generateDockerfile,
  generateDockerIgnore,
  generateDockerCompose,
  generateDockerFiles,
} from '../dockerGenerator';
import { MCPServerConfig } from '../../types';

const baseConfig: MCPServerConfig = {
  name: 'test-server',
  version: '1.0.0',
  transport: 'stdio',
  httpPort: 3000,
  tools: [],
  resources: [],
  prompts: [],
};

const httpConfig: MCPServerConfig = {
  ...baseConfig,
  transport: 'http',
  httpPort: 8080,
};

describe('dockerGenerator', () => {
  describe('generateDockerfile', () => {
    it('uses multi-stage build', () => {
      const df = generateDockerfile(baseConfig);
      expect(df).toContain('AS builder');
      expect(df).toContain('AS production');
    });

    it('creates non-root user', () => {
      const df = generateDockerfile(baseConfig);
      expect(df).toContain('mcpuser');
      expect(df).toContain('USER mcpuser');
    });

    it('sets NODE_ENV=production', () => {
      const df = generateDockerfile(baseConfig);
      expect(df).toContain('NODE_ENV=production');
    });

    it('does NOT expose port for stdio transport', () => {
      const df = generateDockerfile(baseConfig);
      expect(df).not.toContain('EXPOSE');
      expect(df).not.toContain('HEALTHCHECK');
    });

    it('exposes port for HTTP transport', () => {
      const df = generateDockerfile(httpConfig);
      expect(df).toContain('EXPOSE 8080');
      expect(df).toContain('HEALTHCHECK');
    });

    it('uses correct port from config', () => {
      const df = generateDockerfile(httpConfig);
      expect(df).toContain('8080');
    });

    it('defaults to port 3000 when httpPort not set', () => {
      const config = { ...baseConfig, transport: 'http' as const, httpPort: 0 };
      const df = generateDockerfile(config);
      // httpPort is 0, so falls back to 3000
      expect(df).toContain('3000');
    });
  });

  describe('generateDockerIgnore', () => {
    it('excludes node_modules', () => {
      expect(generateDockerIgnore()).toContain('node_modules');
    });

    it('excludes build directory', () => {
      expect(generateDockerIgnore()).toContain('build/');
    });

    it('excludes test files', () => {
      const ignore = generateDockerIgnore();
      expect(ignore).toContain('*.test.ts');
      expect(ignore).toContain('*.spec.ts');
    });

    it('preserves README.md', () => {
      expect(generateDockerIgnore()).toContain('!README.md');
    });
  });

  describe('generateDockerCompose', () => {
    it('generates stdio compose with stdin_open and tty', () => {
      const compose = generateDockerCompose(baseConfig);
      expect(compose).toContain('stdin_open: true');
      expect(compose).toContain('tty: true');
    });

    it('generates HTTP compose with port mapping', () => {
      const compose = generateDockerCompose(httpConfig);
      expect(compose).toContain('"8080:8080"');
      expect(compose).toContain('healthcheck');
    });

    it('sanitizes service name', () => {
      const config = { ...httpConfig, name: 'My Server!' };
      const compose = generateDockerCompose(config);
      expect(compose).toContain('my-server');
      // The sanitized name is used for service/container names
      expect(compose).toContain('container_name: my-server');
    });
  });

  describe('generateDockerFiles', () => {
    it('returns all three files', () => {
      const files = generateDockerFiles(baseConfig);
      expect(Object.keys(files)).toContain('Dockerfile');
      expect(Object.keys(files)).toContain('.dockerignore');
      expect(Object.keys(files)).toContain('docker-compose.yml');
    });
  });
});
