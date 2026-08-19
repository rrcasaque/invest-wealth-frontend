import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, MailCheck, ShieldCheck } from 'lucide-react'
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
import { useVerifyEmail } from '../hooks/useVerifyEmail'
import { verifyEmailSchema, type VerifyEmailValues } from '../schemas'

interface VerifyEmailLocationState {
  email?: string
}

export function VerifyEmailScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { status, submit } = useVerifyEmail()
  const [verifyError, setVerifyError] = useState<string | null>(null)

  const initialEmail = (location.state as VerifyEmailLocationState | null)?.email ?? ''

  const form = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: initialEmail, code: '' },
  })

  const code = form.watch('code')
  const isSubmitting = status === 'submitting'

  const onSubmit = async (values: VerifyEmailValues) => {
    setVerifyError(null)
    const result = await submit(values)
    if (result.status === 'success') {
      toast({
        title: 'E-mail verificado',
        description: result.message ?? 'Sua conta foi ativada. Você já pode entrar.',
      })
      navigate('/entrar', { replace: true })
    } else if (result.status === 'error') {
      setVerifyError(result.message ?? 'Código inválido ou expirado.')
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
            <MailCheck className="size-6" />
          </div>
          <h1 className="font-heading text-xl font-semibold">Verificar E-mail</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Insira o código de 6 dígitos enviado para o seu endereço institucional.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <FormField name="email" invalid={!!form.formState.errors.email}>
            <FormItem>
              <FormLabel htmlFor="email">Endereço de E-mail</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="investidor@instituicao.com"
                  className="font-mono"
                  aria-invalid={!!form.formState.errors.email}
                  {...form.register('email')}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.email?.message}</FormMessage>
            </FormItem>
          </FormField>

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
                />
              </FormControl>
              <FormMessage>{form.formState.errors.code?.message}</FormMessage>
            </FormItem>
          </FormField>

          {verifyError && (
            <p
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {verifyError}
            </p>
          )}

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Verificando...' : 'Ativar Conta'}
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-4 text-center">
          <Link
            to="/entrar"
            className="inline-flex items-center gap-1.5 text-sm text-primary transition-colors hover:text-primary/80"
          >
            <ArrowLeft className="size-4" />
            Retornar ao login
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
