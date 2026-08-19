import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Mail, ShieldCheck, Gauge, User } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { useToast } from '@/shared/ui/toast'
import { appConfig } from '@/shared/config'
import { PasswordInput } from '../components/PasswordInput'
import { PasswordStrength } from '../components/PasswordStrength'
import { useRegister } from '../hooks/useRegister'
import { registerSchema, type RegisterValues } from '../schemas'

const trustIndicators = [
  { icon: ShieldCheck, label: 'Verificado' },
  { icon: ShieldCheck, label: 'Seguro' },
  { icon: Gauge, label: 'Alta frequência' },
]

export function RegisterScreen() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { status, submit } = useRegister()
  const [registerError, setRegisterError] = useState<string | null>(null)

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', workEmail: '', password: '', acceptTerms: false as unknown as true },
  })

  const password = form.watch('password')
  const isSubmitting = status === 'submitting'

  const onSubmit = async (values: RegisterValues) => {
    setRegisterError(null)
    const result = await submit(values)
    if (result.status === 'success') {
      toast({
        title: 'Solicitação enviada',
        description: result.message ?? 'Você receberá um e-mail de verificação.',
      })
      navigate('/verificar-email', { replace: true, state: { email: values.workEmail } })
    } else if (result.status === 'error') {
      setRegisterError(result.message ?? 'Não foi possível concluir o cadastro.')
    }
  }

  return (
    <div className="grid w-full grid-cols-1 overflow-hidden rounded-xl border border-border bg-card shadow-2xl lg:grid-cols-[45%_55%]">
      {/* Institutional hero */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-surface-container-lowest p-8 lg:flex">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-primary/15 via-tertiary/10 to-transparent"
        />
        <div
          aria-hidden
          className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative z-10 flex items-center gap-2">
          <ShieldCheck className="size-7 text-primary" />
          <span className="font-heading text-lg font-bold tracking-tight">{appConfig.name}</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="font-heading text-3xl font-bold leading-tight">
            Precisão de Nível Institucional.
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Acesse balanceamento avançado de portfólio, análises em tempo real e ferramentas de
            simulação de alta frequência projetadas para gestão de capital profissional.
          </p>
          <div className="mt-6 flex items-center gap-4 border-t border-border pt-4">
            <div className="flex -space-x-2">
              {trustIndicators.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex size-8 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-surface-container text-primary"
                  title={label}
                >
                  <Icon className="size-4" />
                </div>
              ))}
            </div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Ecossistema Corporativo Seguro
            </span>
          </div>
        </div>
      </aside>

      {/* Form */}
      <section className="p-6 md:p-8">
        <div className="mb-6">
          <h1 className="font-heading text-3xl font-bold tracking-tight">Criar Conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Insira seus dados profissionais para solicitar acesso à plataforma.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <FormField name="fullName" invalid={!!form.formState.errors.fullName}>
            <FormItem>
              <FormLabel htmlFor="fullName">Nome Completo</FormLabel>
              <FormControl>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="fullName"
                    placeholder="ex: João Silva"
                    className="pl-9"
                    autoComplete="name"
                    aria-invalid={!!form.formState.errors.fullName}
                    {...form.register('fullName')}
                  />
                </div>
              </FormControl>
              <FormMessage>{form.formState.errors.fullName?.message}</FormMessage>
            </FormItem>
          </FormField>

          <FormField name="workEmail" invalid={!!form.formState.errors.workEmail}>
            <FormItem>
              <FormLabel htmlFor="workEmail">E-mail Corporativo</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="workEmail"
                    type="email"
                    placeholder="joao.silva@instituicao.com"
                    className="pl-9"
                    autoComplete="email"
                    aria-invalid={!!form.formState.errors.workEmail}
                    {...form.register('workEmail')}
                  />
                </div>
              </FormControl>
              <FormMessage>{form.formState.errors.workEmail?.message}</FormMessage>
            </FormItem>
          </FormField>

          <FormField name="password" invalid={!!form.formState.errors.password}>
            <FormItem>
              <FormLabel htmlFor="password">Senha Segura</FormLabel>
              <FormControl>
                <PasswordInput
                  id="password"
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  aria-invalid={!!form.formState.errors.password}
                  {...form.register('password')}
                />
              </FormControl>
              {password && <PasswordStrength password={password} className="mt-2" />}
              <FormDescription>
                Deve ter pelo menos 12 caracteres, incluindo números e símbolos.
              </FormDescription>
              <FormMessage>{form.formState.errors.password?.message}</FormMessage>
            </FormItem>
          </FormField>

          <FormField name="acceptTerms" invalid={!!form.formState.errors.acceptTerms}>
            <FormItem className="flex flex-row items-start gap-3">
              <FormControl>
                <Checkbox
                  checked={form.watch('acceptTerms') === true}
                  onCheckedChange={(value) =>
                    form.setValue('acceptTerms', (value === true) as true, {
                      shouldValidate: true,
                    })
                  }
                  aria-invalid={!!form.formState.errors.acceptTerms}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <label htmlFor="acceptTerms" className="text-sm text-muted-foreground">
                  Li e concordo com os{' '}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="text-primary hover:underline">
                        Termos de Serviço
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Termos de Serviço</DialogTitle>
                        <DialogDescription>
                          Ao utilizar a plataforma InvestWealth, você concorda em manter a
                          confidencialidade das informações de negociação, operar dentro dos limites
                          de risco definidos pela sua instituição e seguir as diretrizes de
                          compliance aplicáveis. O uso indevido pode resultar em encerramento de
                          acesso.
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>{' '}
                  e a{' '}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="text-primary hover:underline">
                        Política de Privacidade
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Política de Privacidade</DialogTitle>
                        <DialogDescription>
                          A InvestWealth trata dados pessoais e financeiros conforme a LGPD. Seus
                          dados são criptografados em repouso e em trânsito (AES-256 / TLS 1.3) e
                          nunca compartilhados com terceiros sem consentimento expresso.
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                  .
                </label>
                <FormMessage>{form.formState.errors.acceptTerms?.message}</FormMessage>
              </div>
            </FormItem>
          </FormField>

          {registerError && (
            <p
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {registerError}
            </p>
          )}

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Enviando solicitação...' : 'Solicitar Acesso'}
            {!isSubmitting && <ArrowRight className="size-4" />}
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Já possui uma conta?{' '}
            <Link to="/entrar" className="font-medium text-primary hover:underline">
              Faça login no painel
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
