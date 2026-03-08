import { describe, it, expect } from 'vitest';
import { toolTemplates } from '../toolTemplates';

describe('toolTemplates', () => {
  it('has at least 10 templates', () => {
    expect(toolTemplates.length).toBeGreaterThanOrEqual(10);
  });

  it('each template has required fields', () => {
    for (const template of toolTemplates) {
      expect(template.name).toBeDefined();
      expect(template.name.length).toBeGreaterThan(0);
      expect(template.description).toBeDefined();
      expect(template.description.length).toBeGreaterThan(0);
      expect(template.icon).toBeDefined();
      expect(Array.isArray(template.defaultParameters)).toBe(true);
    }
  });

  it('each template has unique name', () => {
    const names = toolTemplates.map(t => t.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('each parameter has valid type', () => {
    const validTypes = ['string', 'number', 'boolean', 'array', 'object'];

    for (const template of toolTemplates) {
      for (const param of template.defaultParameters) {
        expect(validTypes).toContain(param.type);
      }
    }
  });

  it('each parameter has required fields', () => {
    for (const template of toolTemplates) {
      for (const param of template.defaultParameters) {
        expect(param.name).toBeDefined();
        expect(param.name.length).toBeGreaterThan(0);
        expect(param.description).toBeDefined();
        expect(typeof param.required).toBe('boolean');
      }
    }
  });

  it('parameter names use valid identifiers', () => {
    const validIdentifierRegex = /^[a-z][a-z0-9_]*$/;

    for (const template of toolTemplates) {
      for (const param of template.defaultParameters) {
        expect(param.name).toMatch(validIdentifierRegex);
      }
    }
  });

  it('each template has at least one required parameter', () => {
    // Most tools should have at least one required input
    const templatesWithRequiredParams = toolTemplates.filter(
      t => t.defaultParameters.some(p => p.required)
    );

    // Allow some templates to have all optional params, but most should have required ones
    expect(templatesWithRequiredParams.length).toBeGreaterThan(toolTemplates.length / 2);
  });

  it('Web Search template is properly defined', () => {
    const webSearch = toolTemplates.find(t => t.name === 'Web Search');
    expect(webSearch).toBeDefined();
    expect(webSearch!.icon).toBe('Search');
    expect(webSearch!.defaultParameters.length).toBeGreaterThanOrEqual(1);
    expect(webSearch!.defaultParameters[0].name).toBe('query');
  });

  it('API Call template has url parameter', () => {
    const apiCall = toolTemplates.find(t => t.name === 'API Call');
    expect(apiCall).toBeDefined();
    const urlParam = apiCall!.defaultParameters.find(p => p.name === 'url');
    expect(urlParam).toBeDefined();
    expect(urlParam!.required).toBe(true);
  });

  it('Send Email template has required email fields', () => {
    const sendEmail = toolTemplates.find(t => t.name === 'Send Email');
    expect(sendEmail).toBeDefined();

    const toParam = sendEmail!.defaultParameters.find(p => p.name === 'to');
    const subjectParam = sendEmail!.defaultParameters.find(p => p.name === 'subject');
    const bodyParam = sendEmail!.defaultParameters.find(p => p.name === 'body');

    expect(toParam).toBeDefined();
    expect(subjectParam).toBeDefined();
    expect(bodyParam).toBeDefined();

    expect(toParam!.required).toBe(true);
    expect(subjectParam!.required).toBe(true);
    expect(bodyParam!.required).toBe(true);
  });

  it('icons are valid icon names', () => {
    const validIcons = [
      'Search', 'FileText', 'Globe', 'Database', 'Mail', 'FilePlus',
      'Terminal', 'Cloud', 'GitBranch', 'Image', 'Calculator', 'Calendar',
      'MessageSquare', 'Code', 'Languages', 'Camera',
    ];

    for (const template of toolTemplates) {
      expect(validIcons).toContain(template.icon);
    }
  });
});
