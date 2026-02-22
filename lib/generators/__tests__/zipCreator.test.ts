import { describe, it, expect } from 'vitest';
import { createZipBlob, ExportFile } from '../zipCreator';

describe('zipCreator', () => {
  describe('createZipBlob', () => {
    it('creates a blob from files', async () => {
      const files: ExportFile[] = [
        { name: 'index.ts', content: 'console.log("hello")' },
        { name: 'package.json', content: '{"name": "test"}' },
      ];

      const blob = await createZipBlob(files);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/zip');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('handles nested file paths', async () => {
      const files: ExportFile[] = [
        { name: 'src/index.ts', content: 'export const x = 1;' },
        { name: 'src/utils/helper.ts', content: 'export const helper = () => {};' },
      ];

      const blob = await createZipBlob(files);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });
  });
});
