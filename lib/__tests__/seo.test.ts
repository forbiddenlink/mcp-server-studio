import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/font/google', () => {
  const font = () => ({ className: '', variable: '' })
  return { Inter: font, Red_Hat_Display: font, JetBrains_Mono: font, IBM_Plex_Mono: font }
})
vi.mock('@vercel/speed-insights/next', () => ({ SpeedInsights: () => null }))

const root = join(__dirname, '..', '..')

describe('SEO metadata', () => {
  it('next-sitemap excludes metadata image files from the page list', () => {
    const require = createRequire(import.meta.url)
    const config = require(join(root, 'next-sitemap.config.js'))
    expect(config.exclude).toEqual(
      expect.arrayContaining(['/icon.png', '/opengraph-image.png']),
    )
  })

  it('committed sitemap lists only real pages', () => {
    const xml = readFileSync(join(root, 'public/sitemap.xml'), 'utf8')
    expect(xml).not.toContain('/icon.png')
    expect(xml).not.toContain('/opengraph-image.png')
  })

  it('root layout declares a canonical URL', async () => {
    const { metadata } = await import('../../app/layout')
    expect(metadata.alternates?.canonical).toBe('/')
  })
})
