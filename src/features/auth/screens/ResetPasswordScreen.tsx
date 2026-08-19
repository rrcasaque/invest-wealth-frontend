import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from 'lucide-react'
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
import { useToast } from '@/shared/ui/toast'
import { AuthBrand } from '../components/AuthBrand'
import { CodeInput } from '../components/CodeInput'
import { PasswordInput } from '../components/PasswordInput'
import { PasswordStrength } from '../components/PasswordStrength'
import { useResetPassword } from '../hooks/useResetPassword'
import { resetPasswordSchema, type ResetPasswordValues } from '../schemas'

interface ResetPasswordLocationState {
  email?: string
}

export function ResetPasswordScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { status, submit } = useResetPassword()
  const [resetError, setResetError] = useState<string | null>(null)

  const initialEmail = (location.state as ResetPasswordLocationState | null)?.email ?? ''

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: initialEmail, code: '', newPassword: '' },
  })

  const code = form.watch('code')
  const newPassword = form.watch('newPassword')
  const isSubmitting = status === 'submitting'

  const onSubmit = async (values: ResetPasswordValues) => {
    setResetError(null)
    const result = await submit(values)
    if (result.status === 'success') {
      toast({
        title: 'Senha redefinida',
        description: result.message ?? 'Você já pode entrar com a nova senha.',
      })
      navigate('/entrar', { replace: true })
    } else if (result.status === 'error') {
      setResetError(result.message ?? 'Código inválido ou expirado.')
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
          <h1 className="font-heading text-xl font-semibold">Redefinir Senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informe o código recebido por e-mail e a sua nova senha segura.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <FormField name="email" invalid={!!form.formState.errors.email}>
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

          <FormField name="code" invalid={!!form.formState.errors.code}>
            <FormItem>
              <FormLabel htmlFor="code">Código de Redefinição</FormLabel>
              <FormControl>
                <CodeInput
                  id="code"
                  value={code}
                  onChange={(value) => form.setValue('code', value, { shouldValidate: true })}
                  aria-invalid={!!form.formState.errors.code}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.code?.message}</FormMessage>
            </FormItem>
          </FormField>

          <FormField name="newPassword" invalid={!!form.formState.errors.newPassword}>
            <FormItem>
              <FormLabel htmlFor="newPassword">Nova Senha</FormLabel>
              <FormControl>
                <PasswordInput
                  id="newPassword"
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  aria-invalid={!!form.formState.errors.newPassword}
                  {...form.register('newPassword')}
                />
              </FormControl>
              {newPassword && <PasswordStrength password={newPassword} className="mt-2" />}
              <FormMessage>{form.formState.errors.newPassword?.message}</FormMessage>
            </FormItem>
          </FormField>

          {resetError && (
            <p
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {resetError}
            </p>
          )}

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Redefinindo...' : 'Redefinir Senha'}
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
