/**
 * Sanitization utilities for safe code generation.
 *
 * User-provided strings (tool names, descriptions, URIs) are interpolated
 * into generated TypeScript template literals and markdown. Without
 * sanitization, a malicious input like `"; process.exit(1); //` could
 * produce broken or exploitable generated code.
 */

/**
 * Escapes a string for safe interpolation inside a JavaScript/TypeScript
 * template literal (backtick string). Handles:
 * - Backticks → escaped backtick
 * - ${…} expressions → escaped dollar sign
 * - Backslashes → escaped backslash (must come first)
 */
export function escapeTemplateLiteral(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

/**
 * Escapes a string for safe interpolation inside a double-quoted
 * JavaScript/TypeScript string literal. Handles:
 * - Backslashes → escaped
 * - Double quotes → escaped
 * - Newlines → literal \n
 * - Carriage returns → literal \r
 * - Tabs → literal \t
 */
export function escapeDoubleQuoted(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Sanitizes a string for use as a code identifier (variable/function name).
 * Strips anything that isn't alphanumeric or underscore, ensures it starts
 * with a letter or underscore.
 */
export function sanitizeIdentifier(str: string): string {
  // Convert to snake_case-friendly form
  const cleaned = str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  // Ensure starts with a letter (prefix with underscore if needed)
  if (!cleaned || /^[0-9]/.test(cleaned)) {
    return `_${cleaned || 'unnamed'}`;
  }

  return cleaned;
}

/**
 * Escapes a string for safe inclusion in generated markdown content.
 * Prevents markdown injection (headings, links, code blocks, HTML).
 */
export function escapeMarkdown(str: string): string {
  return str
    .replace(/[\\`*_{}[\]()#+\-.!|~>]/g, '\\$&')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
