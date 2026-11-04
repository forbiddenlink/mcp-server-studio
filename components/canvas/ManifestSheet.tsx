'use client'

import { Fragment, useMemo } from 'react'
import { generateManifest } from '@/lib/generators/manifestGenerator'
import { toolTemplates } from '@/lib/templates/toolTemplates'
import type { MCPServerConfig, MCPTool } from '@/lib/types'

/** The sample tool: the first built-in template, so the sheet shows real generator output. */
export function createSampleTool(): MCPTool {
  const template = toolTemplates[0]
  return {
    id: `tool-${Date.now()}`,
    name: template.name,
    description: template.description,
    icon: template.icon,
    parameters: [...template.defaultParameters],
  }
}

const SAMPLE_CONFIG: MCPServerConfig = {
  name: 'example-server',
  version: '0.1.0',
  transport: 'stdio',
  httpPort: 3000,
  tools: [{ ...createSampleTool(), id: 'sample' }],
  resources: [],
  prompts: [],
}

type TokenKind = 'key' | 'string' | 'literal' | 'punct' | 'name'

interface Token {
  kind: TokenKind
  text: string
}

const TOKEN_CLASS: Record<TokenKind, string> = {
  key: 'text-[var(--accent)]',
  string: 'text-[var(--text-secondary)]',
  literal: 'text-[var(--text-primary)] font-semibold',
  punct: 'text-[var(--text-tertiary)]',
  name: 'text-[var(--vermilion)] font-semibold',
}

/** Split one line of pretty-printed JSON into coloured tokens. */
function tokenizeLine(line: string): Token[] {
  const indent = line.match(/^\s*/)?.[0] ?? ''
  const rest = line.slice(indent.length)
  const tokens: Token[] = []
  if (indent) tokens.push({ kind: 'punct', text: indent })
  const keyMatch = rest.match(/^("(?:[^"\\]|\\.)*")(:\s?)(.*)$/)
  let value = rest
  let isNameKey = false
  if (keyMatch) {
    isNameKey = keyMatch[1] === '"name"'
    tokens.push({ kind: 'key', text: keyMatch[1] })
    tokens.push({ kind: 'punct', text: keyMatch[2] })
    value = keyMatch[3]
  }
  const valueMatch = value.match(/^("(?:[^"\\]|\\.)*"|true|false|null|-?\d[\d.]*)(,?)$/)
  if (valueMatch) {
    const isString = valueMatch[1].startsWith('"')
    tokens.push({
      kind: isString ? (isNameKey && indent.length === 6 ? 'name' : 'string') : 'literal',
      text: valueMatch[1],
    })
    if (valueMatch[2]) tokens.push({ kind: 'punct', text: valueMatch[2] })
  } else if (value) {
    tokens.push({ kind: 'punct', text: value })
  }
  return tokens
}

export function ManifestSheet() {
  const lines = useMemo(
    () => JSON.stringify(generateManifest(SAMPLE_CONFIG), null, 2).split('\n'),
    []
  )

  return (
    <figure className="manifest-sheet text-left w-full" aria-label="Sample server manifest">
      <figcaption className="flex items-center justify-between gap-3 border-b border-[var(--text-primary)] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--text-secondary)] font-ink-mono">
        <span>Sample manifest</span>
        <span>1 tool</span>
      </figcaption>
      <pre className="overflow-x-auto px-3 sm:px-4 py-3 text-[10px] sm:text-[11px] leading-[1.45] font-ink-mono">
        <code>
          {lines.map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static, ordered output lines
            <Fragment key={i}>
              {tokenizeLine(line).map((token, j) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static, ordered tokens
                <span key={j} className={TOKEN_CLASS[token.kind]}>
                  {token.text}
                </span>
              ))}
              {'\n'}
            </Fragment>
          ))}
        </code>
      </pre>
    </figure>
  )
}
