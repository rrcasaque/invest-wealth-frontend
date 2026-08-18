import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/shared/theme'
import { AuthProvider } from '@/shared/auth'
import { TooltipProvider } from '@/shared/ui/tooltip'

interface RenderWithProvidersOptions {
  initialEntries?: string[]
}

/**
 * Render a React element wrapped with the providers required by the app
 * (Router, Theme, Auth, Tooltip). Use this in component tests instead of the
 * raw @testing-library/react render.
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialEntries = ['/'] }: RenderWithProvidersOptions = {},
) {
  return render(
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <TooltipProvider>{ui}</TooltipProvider>
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>,
  )
}
