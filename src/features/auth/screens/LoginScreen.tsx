import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Mail } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { Separator } from '@/shared/ui/separator'
import { useToast } from '@/shared/ui/toast'
import { useAuth } from '@/shared/auth'
import { AuthBrand } from '../components/AuthBrand'
import { PasswordInput } from '../components/PasswordInput'
import { SocialLoginButton } from '../components/SocialLoginButton'
import { useLogin } from '../hooks/useLogin'
import { loginSchema, type LoginValues } from '../schemas'

export function LoginScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { login } = useAuth()
  const { status, submit } = useLogin()
  const [authError, setAuthError] = useState<string | null>(null)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginValues) => {
    setAuthError(null)
    const result = await submit(values)
    if (result.status === 'success' && result.session) {
      login(result.session, result.accessToken)
      toast({ title: 'Bem-vindo de volta', description: 'Sessão iniciada com sucesso.' })
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname
      navigate(from ?? '/painel', { replace: true })
    } else if (result.status === '2fa_required' && result.ticket) {
      toast({
        title: 'Código enviado',
        description: result.message ?? 'Enviamos um código de verificação para o seu e-mail.',
      })
      navigate('/login-2fa', {
        replace: true,
        state: { ticket: result.ticket, email: values.email },
      })
    } else if (result.status === 'error') {
      setAuthError(result.message ?? 'Não foi possível entrar.')
    }
  }

  const isSubmitting = status === 'submitting'

  return (
    <div className="mx-auto w-full max-w-[440px]">
    <div className="glass-panel relative w-full rounded-xl border border-border p-6 shadow-2xl md:p-8">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
      <AuthBrand className="mb-6" />

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <FormField
          name="email"
          invalid={!!form.formState.errors.email}
        >
          <FormItem>
            <FormLabel htmlFor="email">Endereço de E-mail</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="investidor@instituicao.com"
                  className="pl-9 font-mono"
                  aria-invalid={!!form.formState.errors.email}
                  {...form.register('email')}
                />
              </div>
            </FormControl>
            <FormMessage>{form.formState.errors.email?.message}</FormMessage>
          </FormItem>
        </FormField>

        <FormField
          name="password"
          invalid={!!form.formState.errors.password}
        >
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel htmlFor="password">Senha</FormLabel>
              <Link
                to="/recuperar-senha"
                className="text-xs text-primary transition-colors hover:text-primary/80"
              >
                Esqueceu?
              </Link>
            </div>
            <FormControl>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                aria-invalid={!!form.formState.errors.password}
                {...form.register('password')}
              />
            </FormControl>
            <FormMessage>{form.formState.errors.password?.message}</FormMessage>
          </FormItem>
        </FormField>

        {authError && (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {authError}
          </p>
        )}

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Autenticando...' : 'Acessar Terminal'}
          {!isSubmitting && <ArrowRight className="size-4" />}
        </Button>
      </form>

      <div className="relative my-6 flex items-center">
        <Separator className="flex-1" />
        <span className="px-3 text-xs uppercase tracking-widest text-muted-foreground">
          Login Alternativo Seguro
        </span>
        <Separator className="flex-1" />
      </div>

      <SocialLoginButton
        provider="google"
        disabled={isSubmitting}
        onClick={() =>
          toast({
            title: 'Login social indisponível',
            description: 'A integração com Google ainda não está ativa nesta demo.',
          })
        }
      />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Novo no InvestWealth?{' '}
        <Link
          to="/cadastro"
          className="font-medium text-primary transition-colors hover:text-primary/80"
        >
          Solicitar Acesso
        </Link>
      </p>
    </div>
    </div>
  )
}
