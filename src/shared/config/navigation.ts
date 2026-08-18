import {
  BarChart3,
  Briefcase,
  LayoutDashboard,
  LineChart,
  Scale,
  Wallet,
  type LucideIcon
} from 'lucide-react'

export interface NavItem {
  /** Stable id used for active state matching. */
  id: string
  /** User-facing label (pt-BR). */
  label: string
  /** Route path. */
  to: string
  /** Lucide icon. */
  icon: LucideIcon
  /** When true, the item is rendered but disabled (no screen yet). */
  disabled?: boolean
}

export interface NavSection {
  id: string
  items: NavItem[]
}

export const primaryNav: NavItem[] = [
  { id: 'dashboard', label: 'Painel', to: '/painel', icon: LayoutDashboard },
  {
    id: 'investor-wallet',
    label: 'Carteira de Investimentos',
    to: '/carteira',
    icon: Briefcase,
  },
  { id: 'performance', label: 'Desempenho', to: '/desempenho', icon: LineChart },
  { id: 'simulations', label: 'Simulações', to: '/simulacoes', icon: BarChart3 },
  {
    id: 'portfolio-balancing',
    label: 'Balanceamento de Portfólio',
    to: '/balanceamento',
    icon: Scale,
  },
  {
    id: 'payment-assistant',
    label: 'Assistente de Pagamentos',
    to: '/pagamentos',
    icon: Wallet,
  },
]

export const secondaryNav: NavItem[] = [
  // { id: 'settings', label: 'Configurações', to: '/configuracoes', icon: Settings, disabled: true },
  // { id: 'support', label: 'Suporte', to: '/suporte', icon: HelpCircle, disabled: true },
]

export const navSections: NavSection[] = [
  { id: 'primary', items: primaryNav },
  { id: 'secondary', items: secondaryNav },
]
