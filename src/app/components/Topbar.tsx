import { useAuth } from '@/shared/auth'
import { appConfig } from '@/shared/config'
import { useTheme } from '@/shared/theme'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/utils/cn'
import { Bell, LogOut, Menu, Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface TopbarProps {
  onOpenSidebar: () => void
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { theme, toggleTheme } = useTheme()
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/entrar', { replace: true })
  }

  const initials = session?.name
    ? session.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'IW'

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-border bg-surface/80 px-3 backdrop-blur-md sm:px-4 md:px-6',
      )}
    >
      {/* Left: mobile menu + brand + search */}
      <div className="flex flex-1 items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={onOpenSidebar}
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </Button>
        <span className="font-heading text-lg font-bold tracking-tight text-primary md:hidden">
          {appConfig.name}
        </span>        
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 md:gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notificações"
          className="relative"
        >
          <Bell className="size-5" />
          <span
            aria-hidden
            className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-surface"
          />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Menu da conta"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-surface-container-highest text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{session?.name ?? 'Usuário'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Perfil</DropdownMenuItem>
            <DropdownMenuItem disabled>Preferências</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
