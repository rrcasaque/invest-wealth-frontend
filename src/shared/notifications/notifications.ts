/**
 * Helpers para notificações do sistema via Service Worker.
 *
 * Em Android (Chrome/PWA instalado), `registration.showNotification()`
 * exibe a notificação na barra de notificações do celular.
 * Em iOS 16.4+ funciona apenas quando o app está instalado no home screen.
 */

const SW_PATH = '/sw.js'

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator
}

export function getNotificationPermission(): NotificationPermission | null {
  if (!isNotificationSupported()) return null
  return Notification.permission
}

/**
 * Registra o service worker da aplicação.
 * Seguro chamar múltiplas vezes — o navegador reutiliza o registro existente.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.register(SW_PATH, { scope: '/' })
  } catch (err) {
    console.error('[notifications] falha ao registrar service worker:', err)
    return null
  }
}

/**
 * Solicita permissão para exibir notificações.
 * Retorna o estado final da permissão.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

/**
 * Envia uma notificação de teste para a barra de notificações do dispositivo.
 * Garante permissão + service worker ativo antes de disparar.
 */
export async function sendTestNotification(): Promise<{ ok: boolean; error?: string }> {
  if (!isNotificationSupported()) {
    return { ok: false, error: 'Notificações não são suportadas neste dispositivo/navegador.' }
  }

  const permission = await requestNotificationPermission()
  if (permission !== 'granted') {
    return { ok: false, error: 'Permissão de notificações negada. Habilite nas configurações do navegador.' }
  }

  const registration = await registerServiceWorker()
  if (!registration) {
    return { ok: false, error: 'Não foi possível registrar o service worker.' }
  }

  // Aguarda o SW estar ativo (necessário na primeira instalação)
  await navigator.serviceWorker.ready

  const payload = {
    type: 'SHOW_NOTIFICATION',
    title: 'InvestWealth — Notificação de Teste',
    body: 'Se você está vendo isto, as notificações estão funcionando! 🎉',
    icon: '/favicon.svg',
    tag: 'investwealth-test',
  }

  try {
    // Tenta via postMessage (canal preferido, funciona com SW ativo)
    const active = registration.active || navigator.serviceWorker.controller
    if (active) {
      active.postMessage(payload)
      return { ok: true }
    }
    // Fallback: showNotification direto pela registration
    await registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.icon,
      tag: payload.tag,
    })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao exibir a notificação.' }
  }
}
