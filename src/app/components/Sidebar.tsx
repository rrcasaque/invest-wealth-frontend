import { NavLink } from 'react-router-dom'
import { Bell, BellRing, X, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { appConfig, primaryNav, secondaryNav, type NavItem } from '@/shared/config'
import { Button } from '@/shared/ui/button'
import { useToast } from '@/shared/ui/toast'
import {
  sendTestNotification,
  sendScheduledNotification,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  hasPushSubscription,
  isPushSupported,
} from '@/shared/notifications'

interface SidebarProps {
  /** Mobile drawer open state. */
  open: boolean
  onClose: () => void
}

function NavItemLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      aria-disabled={item.disabled}
      tabIndex={item.disabled ? -1 : undefined}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-surface-container-high hover:text-foreground',
          item.disabled && 'pointer-events-none opacity-40',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            aria-hidden
            className={cn(
              'absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-opacity',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
          />
          <Icon className="size-5 shrink-0" aria-hidden />
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Navegação principal"
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary font-heading text-sm font-black text-primary-foreground">
              IW
            </div>
            <div className="leading-tight">
              <p className="font-heading text-base font-black tracking-tight">{appConfig.name}</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {appConfig.tagline}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Primary nav */}
        <nav className="relative flex-1 overflow-y-auto px-2 py-4">
          <ul className="flex flex-col gap-1">
            {primaryNav.map((item) => (
              <li key={item.id} className="relative">
                <NavItemLink item={item} onNavigate={onClose} />
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer: secondary nav + testar notificação */}
        <div className="flex flex-col gap-3 border-t border-sidebar-border px-4 py-4">
          <ul className="flex flex-col gap-1">
            {secondaryNav.map((item) => (
              <li key={item.id} className="relative">
                <NavItemLink item={item} onNavigate={onClose} />
              </li>
            ))}
          </ul>
          <PushSubscriptionButton />
          <TestNotificationButton />
          <TestScheduledNotificationButton />
        </div>
      </aside>
    </>
  )
}

function TestNotificationButton() {
  const { toast } = useToast()
  const [isSending, setIsSending] = useState(false)

  const handleClick = async () => {
    setIsSending(true)
    try {
      const result = await sendTestNotification()
      if (result.ok) {
        toast({
          title: 'Notificação enviada',
          description: 'Verifique a barra de notificações do seu dispositivo.',
          variant: 'success',
        })
      } else {
        toast({
          title: 'Não foi possível notificar',
          description: result.error,
          variant: 'destructive',
        })
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full justify-start gap-2"
      onClick={handleClick}
      disabled={isSending}
    >
      <Bell className="size-4" />
      Testar Notificação
    </Button>
  )
}

function PushSubscriptionButton() {
  const { toast } = useToast()
  const [subscribed, setSubscribed] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    if (!isPushSupported()) return
    hasPushSubscription().then(setSubscribed).catch(() => setSubscribed(false))
  }, [])

  const handleSubscribe = async () => {
    setIsBusy(true)
    try {
      const result = await subscribeToPushNotifications()
      if (result.ok) {
        setSubscribed(true)
        toast({
          title: 'Notificações ativadas',
          description: 'Você receberá notificações automáticas a cada 5 minutos, mesmo com o app fechado.',
          variant: 'success',
        })
      } else {
        toast({
          title: 'Falha ao ativar',
          description: result.error,
          variant: 'destructive',
        })
      }
    } finally {
      setIsBusy(false)
    }
  }

  const handleUnsubscribe = async () => {
    setIsBusy(true)
    try {
      const result = await unsubscribeFromPushNotifications()
      if (result.ok) {
        setSubscribed(false)
        toast({
          title: 'Notificações desativadas',
          description: 'Você não receberá mais notificações automáticas.',
          variant: 'success',
        })
      } else {
        toast({
          title: 'Falha ao desativar',
          description: result.error,
          variant: 'destructive',
        })
      }
    } finally {
      setIsBusy(false)
    }
  }

  if (!isPushSupported()) {
    return (
      <Button variant="outline" size="sm" className="w-full justify-start gap-2" disabled>
        <Zap className="size-4" />
        Push não suportado
      </Button>
    )
  }

  return (
    <Button
      variant={subscribed ? 'default' : 'outline'}
      size="sm"
      className="w-full justify-start gap-2"
      onClick={subscribed ? handleUnsubscribe : handleSubscribe}
      disabled={isBusy}
    >
      <Zap className="size-4" />
      {subscribed ? 'Notificações Ativas' : 'Ativar Notificações'}
    </Button>
  )
}

function TestScheduledNotificationButton() {
  const { toast } = useToast()
  const [isScheduling, setIsScheduling] = useState(false)

  const handleClick = async () => {
    setIsScheduling(true)
    try {
      const FIVE_MINUTES_MS = 5 * 60 * 1000
      const result = await sendScheduledNotification(FIVE_MINUTES_MS)
      if (result.ok && result.scheduledAt) {
        const horario = new Date(result.scheduledAt).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
        toast({
          title: 'Notificação agendada',
          description: `Você receberá uma notificação às ${horario} (daqui a 5 minutos). Mantenha o app aberto ou instalado.`,
          variant: 'success',
        })
      } else {
        toast({
          title: 'Não foi possível agendar',
          description: result.error,
          variant: 'destructive',
        })
      }
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full justify-start gap-2"
      onClick={handleClick}
      disabled={isScheduling}
    >
      <BellRing className="size-4" />
      Testar Notificação (5min)
    </Button>
  )
}
