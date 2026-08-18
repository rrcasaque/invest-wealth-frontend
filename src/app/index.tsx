import { Suspense } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/shared/theme'
import { AuthProvider } from '@/shared/auth'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { Toaster } from '@/shared/ui/toast'
import { AppRoutes, RouteFallback } from './routes'

export function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <BrowserRouter>
          <TooltipProvider delayDuration={150}>
            <Suspense fallback={<RouteFallback />}>
              <AppRoutes />
            </Suspense>
            <Toaster />
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
