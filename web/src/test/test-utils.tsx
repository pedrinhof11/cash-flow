import React from 'react'
import { render, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { RenderOptions } from '@testing-library/react'

const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0 },
    mutations: { gcTime: 0 },
  },
})

interface AllTheProvidersProps {
  children: React.ReactNode
  initialEntries?: string[]
}

function AllTheProviders({ children, initialEntries = ['/'] }: AllTheProvidersProps) {
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false })
  return (
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialEntries?: string[] },
) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders initialEntries={options?.initialEntries}>{children}</AllTheProviders>
  )
  return render(ui, { wrapper: wrapper as React.ComponentType<{ children: React.ReactNode }>, ...options })
}

const customRenderHook = <TProps, TResult>(
  hook: (props: TProps) => TResult,
  options?: { initialEntries?: string[] },
) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders initialEntries={options?.initialEntries}>{children}</AllTheProviders>
  )
  return renderHook(hook, { wrapper: wrapper as React.ComponentType<{ children: React.ReactNode }> })
}

export * from '@testing-library/react'
export { customRender as render, customRenderHook as renderHook }
