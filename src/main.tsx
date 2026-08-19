import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './app'
import { registerServiceWorker } from '@/shared/notifications'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registra o service worker para habilitar PWA + notificações do sistema.
// Em dev o SW não é registrado porque sua estratégia cache-first
// intercepta os módulos servidos pelo Vite e serve versões stale,
// quebrando HMR e atualizações de código.
if (import.meta.env.PROD) {
  registerServiceWorker().catch((err) => console.error('[sw] registro falhou:', err))
}
