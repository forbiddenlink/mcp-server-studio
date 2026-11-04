import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { generateManifest } from '@/lib/generators/manifestGenerator'
import { toolTemplates } from '@/lib/templates/toolTemplates'
import { ManifestSheet } from '../canvas/ManifestSheet'

describe('ManifestSheet', () => {
  it('renders the real generateManifest output for the sample tool', () => {
    const { container } = render(<ManifestSheet />)
    const text = container.querySelector('code')?.textContent ?? ''
    const parsed = JSON.parse(text)
    const template = toolTemplates[0]
    expect(parsed).toEqual(
      generateManifest({
        name: 'example-server',
        version: '0.1.0',
        transport: 'stdio',
        httpPort: 3000,
        tools: [
          {
            id: 'sample',
            name: template.name,
            description: template.description,
            icon: template.icon,
            parameters: template.defaultParameters,
          },
        ],
        resources: [],
        prompts: [],
      })
    )
  })
})
