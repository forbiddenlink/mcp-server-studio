import { describe, it, expect } from 'vitest';
import {
  escapeTemplateLiteral,
  escapeDoubleQuoted,
  sanitizeIdentifier,
  escapeMarkdown,
} from '../sanitize';

describe('sanitize', () => {
  describe('escapeTemplateLiteral', () => {
    it('escapes backticks', () => {
      expect(escapeTemplateLiteral('hello`world')).toBe('hello\\`world');
    });

    it('escapes ${} expressions', () => {
      expect(escapeTemplateLiteral('${process.exit(1)}')).toBe('\\${process.exit(1)}');
    });

    it('escapes backslashes', () => {
      expect(escapeTemplateLiteral('path\\to\\file')).toBe('path\\\\to\\\\file');
    });

    it('handles combined dangerous input', () => {
      const malicious = '`; process.exit(1); //`${code}';
      const escaped = escapeTemplateLiteral(malicious);
      // Raw backticks are escaped — every ` is preceded by \
      expect(escaped).toContain('\\`');
      expect(escaped).toContain('\\${');
      // No unescaped backtick (i.e., not starting with backtick)
      expect(escaped.startsWith('`')).toBe(false);
    });

    it('leaves safe strings unchanged', () => {
      expect(escapeTemplateLiteral('hello world')).toBe('hello world');
    });
  });

  describe('escapeDoubleQuoted', () => {
    it('escapes double quotes', () => {
      expect(escapeDoubleQuoted('say "hello"')).toBe('say \\"hello\\"');
    });

    it('escapes newlines', () => {
      expect(escapeDoubleQuoted('line1\nline2')).toBe('line1\\nline2');
    });

    it('escapes carriage returns', () => {
      expect(escapeDoubleQuoted('line1\rline2')).toBe('line1\\rline2');
    });

    it('escapes tabs', () => {
      expect(escapeDoubleQuoted('col1\tcol2')).toBe('col1\\tcol2');
    });

    it('escapes backslashes', () => {
      expect(escapeDoubleQuoted('C:\\Users')).toBe('C:\\\\Users');
    });

    it('handles injection attempt', () => {
      const malicious = '"; process.exit(1); //';
      const escaped = escapeDoubleQuoted(malicious);
      // The key defense: the leading " is escaped so the string can't break out
      expect(escaped).toContain('\\"');
      expect(escaped.startsWith('\\"')).toBe(true);
    });
  });

  describe('sanitizeIdentifier', () => {
    it('converts spaces to underscores', () => {
      expect(sanitizeIdentifier('my tool')).toBe('my_tool');
    });

    it('strips special characters', () => {
      expect(sanitizeIdentifier('hello!@#world')).toBe('helloworld');
    });

    it('lowercases', () => {
      expect(sanitizeIdentifier('MyTool')).toBe('mytool');
    });

    it('prefixes with underscore if starts with number', () => {
      expect(sanitizeIdentifier('123abc')).toBe('_123abc');
    });

    it('returns _unnamed for empty string', () => {
      expect(sanitizeIdentifier('')).toBe('_unnamed');
    });

    it('returns _unnamed for all-special-chars', () => {
      expect(sanitizeIdentifier('!@#$%')).toBe('_unnamed');
    });

    it('collapses multiple underscores', () => {
      expect(sanitizeIdentifier('a   b___c')).toBe('a_b_c');
    });
  });

  describe('escapeMarkdown', () => {
    it('escapes markdown heading chars', () => {
      expect(escapeMarkdown('# heading')).toContain('\\#');
    });

    it('escapes HTML angle brackets', () => {
      const escaped = escapeMarkdown('<script>alert("xss")</script>');
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
    });

    it('escapes backticks', () => {
      expect(escapeMarkdown('`code`')).toContain('\\`');
    });

    it('escapes link syntax', () => {
      const escaped = escapeMarkdown('[click](http://evil.com)');
      expect(escaped).toContain('\\[');
      expect(escaped).toContain('\\]');
    });
  });
});
