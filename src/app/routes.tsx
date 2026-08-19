import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { AuthLayout } from './components/AuthLayout'
import { RequireAuth } from '@/shared/auth'
import { useAuth } from '@/shared/auth'
import { PageContainer } from '@/shared/layout'
import { Skeleton } from '@/shared/ui/skeleton'

function RouteFallback() {
  return (
    <PageContainer maxWidth="wide" className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="h-80" />
    </PageContainer>
  )
}

const LoginScreen = lazy(() =>
  import('@/features/auth/screens/LoginScreen').then((m) => ({ default: m.LoginScreen })),
)
const RegisterScreen = lazy(() =>
  import('@/features/auth/screens/RegisterScreen').then((m) => ({ default: m.RegisterScreen })),
)
const PasswordRecoveryScreen = lazy(() =>
  import('@/features/auth/screens/PasswordRecoveryScreen').then((m) => ({
    default: m.PasswordRecoveryScreen,
  })),
)
const VerifyEmailScreen = lazy(() =>
  import('@/features/auth/screens/VerifyEmailScreen').then((m) => ({
    default: m.VerifyEmailScreen,
  })),
)
const Login2faScreen = lazy(() =>
  import('@/features/auth/screens/Login2faScreen').then((m) => ({
    default: m.Login2faScreen,
  })),
)
const ResetPasswordScreen = lazy(() =>
  import('@/features/auth/screens/ResetPasswordScreen').then((m) => ({
    default: m.ResetPasswordScreen,
  })),
)

const DashboardScreen = lazy(() =>
  import('@/features/dashboard/screens/DashboardScreen').then((m) => ({
    default: m.DashboardScreen,
  })),
)
const PerformanceScreen = lazy(() =>
  import('@/features/performance/screens/PerformanceScreen').then((m) => ({
    default: m.PerformanceScreen,
  })),
)
const SimulationsScreen = lazy(() =>
  import('@/features/simulations/screens/SimulationsScreen').then((m) => ({
    default: m.SimulationsScreen,
  })),
)
const PortfolioBalancingScreen = lazy(() =>
  import('@/features/portfolio-balancing/screens/PortfolioBalancingScreen').then((m) => ({
    default: m.PortfolioBalancingScreen,
  })),
)
const PaymentAssistantScreen = lazy(() =>
  import('@/features/payment-assistant/screens/PaymentAssistantScreen').then((m) => ({
    default: m.PaymentAssistantScreen,
  })),
)
const InvestorWalletScreen = lazy(() =>
  import('@/features/investor-wallet/screens/InvestorWalletScreen').then((m) => ({
    default: m.InvestorWalletScreen,
  })),
)

export function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Rotas públicas (autenticação) */}
      <Route element={<AuthLayout />}>
        <Route path="/entrar" element={<LoginScreen />} />
        <Route path="/cadastro" element={<RegisterScreen />} />
        <Route path="/recuperar-senha" element={<PasswordRecoveryScreen />} />
        <Route path="/verificar-email" element={<VerifyEmailScreen />} />
        <Route path="/login-2fa" element={<Login2faScreen />} />
        <Route path="/redefinir-senha" element={<ResetPasswordScreen />} />
      </Route>

      {/* Rotas protegidas */}
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/painel" element={<DashboardScreen />} />
        <Route path="/desempenho" element={<PerformanceScreen />} />
        <Route path="/simulacoes" element={<SimulationsScreen />} />
        <Route path="/balanceamento" element={<PortfolioBalancingScreen />} />
        <Route path="/pagamentos" element={<PaymentAssistantScreen />} />
        <Route path="/carteira" element={<InvestorWalletScreen />} />
      </Route>

      {/* Base redireciona conforme autenticação */}
      <Route path="/" element={<Navigate to={isAuthenticated ? '/painel' : '/entrar'} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/painel' : '/entrar'} replace />} />
    </Routes>
  )
}

export { RouteFallback, Suspense }
