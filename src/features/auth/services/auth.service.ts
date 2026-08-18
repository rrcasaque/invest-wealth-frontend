import type {
  AuthResult,
  AuthSession,
  LoginCredentials,
  PasswordRecoveryPayload,
  RegisterPayload,
} from '../types'

const NETWORK_DELAY = 900

// REMOVER: Credenciais de teste — substituir por autenticação real (backend/API).
const TEST_EMAIL = 'emailteste@gmail.com'
const TEST_PASSWORD = 'teste123'

function delay<T>(value: T, ms = NETWORK_DELAY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/**
 * Mock authentication service.
 *
 * All methods simulate network latency and return deterministic results so
 * the UI can exercise loading, success and error states without a backend.
 * Replace these implementations with real HTTP calls when the API is ready.
 */
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResult & { session?: AuthSession }> {
    if (!credentials.email || !credentials.password) {
      return delay({ status: 'error', message: 'Credenciais inválidas.' })
    }
    // REMOVER: Validação de credenciais de teste — substituir por chamada à API.
    const isValidTestUser =
      credentials.email.toLowerCase() === TEST_EMAIL &&
      credentials.password === TEST_PASSWORD

    if (!isValidTestUser) {
      return delay({ status: 'error', message: 'E-mail ou senha incorretos.' })
    }
    return delay({
      status: 'success',
      session: {
        userId: 'usr_demo',
        email: credentials.email,
        name: 'Investidor Teste',
      },
    })
  },

  async register(payload: RegisterPayload): Promise<AuthResult> {
    if (!payload.fullName || !payload.workEmail || payload.password.length < 12) {
      return delay({ status: 'error', message: 'Não foi possível concluir o cadastro.' })
    }
    return delay({
      status: 'success',
      message: 'Solicitação recebida. Você receberá um e-mail de verificação.',
    })
  },

  async requestPasswordRecovery(payload: PasswordRecoveryPayload): Promise<AuthResult> {
    if (!payload.email) {
      return delay({ status: 'error', message: 'Informe um e-mail válido.' })
    }
    return delay({
      status: 'success',
      message: `Instruções enviadas para ${payload.email}.`,
    })
  },
}
