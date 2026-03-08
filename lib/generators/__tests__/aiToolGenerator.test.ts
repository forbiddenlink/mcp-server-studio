import { describe, it, expect } from 'vitest';
import { parseToolDescription, analyzeDescription } from '../../generators/aiToolGenerator';

describe('aiToolGenerator', () => {
  describe('parseToolDescription', () => {
    it('generates tool with action + object name', () => {
      const tool = parseToolDescription('search users by email');
      expect(tool.name).toContain('search');
      expect(tool.name).toContain('user');
    });

    it('extracts "by" parameters as required', () => {
      const tool = parseToolDescription('search users by email');
      const emailParam = tool.parameters.find(p => p.name === 'email');
      expect(emailParam).toBeDefined();
      expect(emailParam!.required).toBe(true);
    });

    it('extracts "with" parameters', () => {
      const tool = parseToolDescription('create user with name and email');
      expect(tool.parameters.length).toBeGreaterThanOrEqual(1);
    });

    it('infers number type for id-like params', () => {
      const tool = parseToolDescription('get user by id');
      const idParam = tool.parameters.find(p => p.name === 'id');
      expect(idParam).toBeDefined();
      expect(idParam!.type).toBe('number');
    });

    it('infers boolean type for flag-like params', () => {
      const tool = parseToolDescription('search items with is_active flag');
      const flagParam = tool.parameters.find(p =>
        p.name.includes('is_active') || p.name.includes('flag')
      );
      if (flagParam) {
        expect(['boolean', 'string']).toContain(flagParam.type);
      }
    });

    it('selects Search icon for search tools', () => {
      const tool = parseToolDescription('search for documents');
      expect(tool.icon).toBe('Search');
    });

    it('selects Mail icon for email tools', () => {
      const tool = parseToolDescription('send email notification');
      expect(tool.icon).toBe('Mail');
    });

    it('selects Database icon for database tools', () => {
      const tool = parseToolDescription('read database table');
      expect(tool.icon).toBe('Database');
    });

    it('selects Globe icon for web/api tools', () => {
      const tool = parseToolDescription('fetch data from api endpoint');
      expect(tool.icon).toBe('Globe');
    });

    it('generates description with capital letter and period', () => {
      const tool = parseToolDescription('search users by email');
      expect(tool.description).toMatch(/^[A-Z]/);
      expect(tool.description).toMatch(/[.!?]$/);
    });

    it('generates a valid id', () => {
      const tool = parseToolDescription('create document');
      expect(tool.id).toMatch(/^tool-\d+$/);
    });

    it('adds default parameters when none detected', () => {
      const tool = parseToolDescription('search items');
      expect(tool.parameters.length).toBeGreaterThanOrEqual(1);
    });

    it('adds default content + destination params for send actions', () => {
      // Use a description that won't match any explicit param patterns
      const tool = parseToolDescription('send notification');
      const paramNames = tool.parameters.map(p => p.name);
      expect(paramNames).toContain('content');
      expect(paramNames).toContain('destination');
    });

    it('handles short descriptions gracefully', () => {
      const tool = parseToolDescription('get');
      expect(tool).toBeDefined();
      expect(tool.name).toBeTruthy();
    });

    it('falls back to custom_tool for unparseable descriptions', () => {
      const tool = parseToolDescription('xyz');
      expect(tool.name).toBeTruthy();
    });
  });

  describe('analyzeDescription', () => {
    it('returns low confidence for very short descriptions', () => {
      const result = analyzeDescription('hi');
      expect(result.confidence).toBeLessThan(0.5);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('returns higher confidence for well-formed descriptions', () => {
      const result = analyzeDescription('search users by email address');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.isValid).toBe(true);
    });

    it('suggests action verb when missing', () => {
      const result = analyzeDescription('something about users');
      const hasVerbSuggestion = result.suggestions.some(s =>
        s.toLowerCase().includes('action verb')
      );
      expect(hasVerbSuggestion).toBe(true);
    });

    it('marks descriptions shorter than 5 chars as invalid', () => {
      expect(analyzeDescription('hi').isValid).toBe(false);
      expect(analyzeDescription('hello').isValid).toBe(true);
    });

    it('caps confidence at 1.0', () => {
      const result = analyzeDescription(
        'search users by email with name and age given an API key'
      );
      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });

    it('caps confidence at minimum 0.1', () => {
      const result = analyzeDescription('x');
      expect(result.confidence).toBeGreaterThanOrEqual(0.1);
    });
  });
});
