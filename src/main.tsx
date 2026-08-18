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
// Em dev, só registra se estiver em localhost (SW exige HTTPS ou localhost).
if (import.meta.env.PROD || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  registerServiceWorker().catch((err) => console.error('[sw] registro falhou:', err))
}
