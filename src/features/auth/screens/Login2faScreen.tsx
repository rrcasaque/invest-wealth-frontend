import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { useToast } from '@/shared/ui/toast'
import { useAuth } from '@/shared/auth'
import { AuthBrand } from '../components/AuthBrand'
import { CodeInput } from '../components/CodeInput'
import { useLogin2fa } from '../hooks/useLogin2fa'
import { login2faSchema, type Login2faValues } from '../schemas'

interface Login2faLocationState {
  ticket?: string
  email?: string
}

export function Login2faScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { login } = useAuth()
  const { status, submit } = useLogin2fa()
  const [authError, setAuthError] = useState<string | null>(null)

  const state = (location.state as Login2faLocationState | null) ?? {}
  const ticket = state.ticket ?? ''

  const form = useForm<Login2faValues>({
    resolver: zodResolver(login2faSchema),
    defaultValues: { code: '' },
  })

  const code = form.watch('code')
  const isSubmitting = status === 'submitting'

  const onSubmit = async (values: Login2faValues) => {
    setAuthError(null)
    if (!ticket) {
      setAuthError('Sessão 2FA inválida. Inicie o login novamente.')
      return
    }
    const result = await submit({ ticket, code: values.code })
    if (result.status === 'success' && result.session) {
      login(result.session, result.accessToken)
      toast({ title: 'Bem-vindo de volta', description: 'Sessão iniciada com sucesso.' })
      navigate('/painel', { replace: true })
    } else if (result.status === 'error') {
      setAuthError(result.message ?? 'Código inválido ou expirado.')
    }
  }

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <div className="glass-panel relative w-full rounded-xl border border-border p-6 shadow-2xl md:p-8">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />
        <AuthBrand className="mb-6" />

        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-lg border border-border bg-surface-container-high text-primary shadow-lg">
            <KeyRound className="size-6" />
          </div>
          <h1 className="font-heading text-xl font-semibold">Autenticação 2FA</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enviamos um código de 6 dígitos para o seu e-mail institucional.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <FormField name="code" invalid={!!form.formState.errors.code}>
            <FormItem>
              <FormLabel htmlFor="code">Código de Verificação</FormLabel>
              <FormControl>
                <CodeInput
                  id="code"
                  value={code}
                  onChange={(value) => form.setValue('code', value, { shouldValidate: true })}
                  aria-invalid={!!form.formState.errors.code}
                  disabled={isSubmitting}
                  autoFocus
                />
              </FormControl>
              <FormMessage>{form.formState.errors.code?.message}</FormMessage>
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
            {isSubmitting ? 'Validando...' : 'Confirmar Acesso'}
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-4 text-center">
          <Link
            to="/entrar"
            className="inline-flex items-center gap-1.5 text-sm text-primary transition-colors hover:text-primary/80"
          >
            <ArrowLeft className="size-4" />
            Voltar ao login
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground/70">
          <ShieldCheck className="size-3.5" />
          <span>Sessão Criptografada AES-256</span>
        </div>
      </div>
    </div>
  )
}
