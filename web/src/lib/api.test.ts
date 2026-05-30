import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('API client configuration', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
  })

  it('creates with correct baseURL', async () => {
    const { default: api } = await import('../lib/api')
    expect(api.defaults.baseURL).toBe('/api')
  })

  it('sets Accept header', async () => {
    const { default: api } = await import('../lib/api')
    expect(api.defaults.headers.common['Accept']).toContain('application/json')
  })
})
