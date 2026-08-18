import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { ArrowLeft, KeyRound, Mail, MailCheck, ShieldCheck } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { usePasswordRecovery } from '../hooks/usePasswordRecovery'
import { passwordRecoverySchema, type PasswordRecoveryValues } from '../schemas'

export function PasswordRecoveryScreen() {
  const { status, submittedEmail, submit, reset } = usePasswordRecovery()

  const form = useForm<PasswordRecoveryValues>({
    resolver: zodResolver(passwordRecoverySchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: PasswordRecoveryValues) => {
    await submit(values)
  }

  const isSuccess = status === 'success'

  return (
    <div className="mx-auto w-full max-w-[440px]">
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-surface-container-low p-6 shadow-2xl md:p-8">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />

      {/* Brand */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-lg border border-border bg-surface-container-high text-primary shadow-lg">
          <ShieldCheck className="size-6" />
        </div>
        <p className="font-heading text-lg font-semibold tracking-tight">InvestWealth</p>
      </div>

      {!isSuccess ? (
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="font-heading text-xl font-semibold">Recuperar Acesso</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Insira o endereço de e-mail institucional associado à sua conta para receber um link
              de redefinição seguro.
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
                      placeholder="nome@instituicao.com"
                      className="pl-9"
                      autoComplete="email"
                      aria-invalid={!!form.formState.errors.email}
                      {...form.register('email')}
                    />
                  </div>
                </FormControl>
                <FormMessage>{form.formState.errors.email?.message}</FormMessage>
              </FormItem>
            </FormField>

            {status === 'error' && (
              <p
                role="alert"
                className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                Não foi possível enviar o link de recuperação. Tente novamente.
              </p>
            )}

            <Button type="submit" size="lg" disabled={status === 'submitting'} className="w-full">
              {status === 'submitting' ? (
                <>
                  <KeyRound className="size-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  <KeyRound className="size-4" />
                  Enviar Link de Recuperação
                </>
              )}
            </Button>
          </form>

          <div className="border-t border-border pt-4 text-center">
            <Link
              to="/entrar"
              className="inline-flex items-center gap-1.5 text-sm text-primary transition-colors hover:text-primary/80"
            >
              <ArrowLeft className="size-4" />
              Retornar ao Login Seguro
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex size-16 items-center justify-center rounded-full border border-success/30 bg-success/15 text-success">
            <span
              aria-hidden
              className="absolute inset-0 animate-ping rounded-full border border-success/30 opacity-20"
            />
            <MailCheck className="size-7" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">Protocolo Iniciado</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Instruções seguras foram transmitidas para
              <br />
              <strong className="font-mono text-foreground">
                {submittedEmail ?? 'o seu e-mail'}
              </strong>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            O link expirará em 15 minutos para garantir segurança operacional rigorosa.
          </p>
          <Button variant="outline" className="w-full" onClick={reset}>
            Reconhecer e Retornar
          </Button>
          <Link
            to="/entrar"
            className="inline-flex items-center gap-1.5 text-sm text-primary transition-colors hover:text-primary/80"
          >
            <ArrowLeft className="size-4" />
            Ir para o login
          </Link>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground/70">
        <ShieldCheck className="size-3.5" />
        <span>Sessão Criptografada AES-256</span>
      </div>
    </div>
    </div>
  )
}
