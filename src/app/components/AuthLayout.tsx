import { Outlet } from 'react-router-dom'

/**
 * Layout for unauthenticated screens (login, register, password recovery).
 * Renders an ambient institutional background and centers the active route.
 */
export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-1/4 size-[500px] rounded-full bg-tertiary/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 bottom-0 size-[500px] rounded-full bg-primary/10 blur-[120px]"
      />
      <div className="relative z-10 w-full max-w-[920px]">
        <Outlet />
      </div>
    </div>
  )
}
