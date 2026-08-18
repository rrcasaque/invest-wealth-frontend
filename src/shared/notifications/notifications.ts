/**
 * Helpers para notificações do sistema via Service Worker + Web Push.
 *
 * Web Push (VAPID) é o canal confiável para notificações com app fechado:
 * o backend envia um push via FCM/Mozilla, o navegador acorda o SW,
 * e o handler `push` em sw.js exibe a notificação do sistema.
 */

const SW_PATH = '/sw.js'
const API_URL = import.meta.env.VITE_API_URL ?? ''
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? ''

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator
}

export function isPushSupported(): boolean {
  return (
    isNotificationSupported() &&
    'PushManager' in window &&
    typeof API_URL === 'string' &&
    API_URL.length > 0
  )
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
 * Converte a VAPID public key (base64url string) em Uint8Array,
 * formato exigido por `pushManager.subscribe`.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}

/**
 * Converte Uint8Array para BufferSource compatível com a lib DOM do TS 6.
 * (Workaround para incompatibilidade ArrayBufferLike vs ArrayBuffer.)
 */
function toBufferSource(input: Uint8Array): ArrayBuffer {
  return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength) as ArrayBuffer
}

/**
 * Busca a VAPID public key. Tenta primeiro do .env (VITE_VAPID_PUBLIC_KEY);
 * se não estiver configurada, busca no backend em GET /notifications/vapid-public-key.
 */
async function resolveVapidPublicKey(): Promise<string | null> {
  if (VAPID_PUBLIC_KEY) return VAPID_PUBLIC_KEY
  if (!API_URL) return null
  try {
    const res = await fetch(`${API_URL}/notifications/vapid-public-key`)
    if (!res.ok) return null
    const data = (await res.json()) as { publicKey?: string }
    return data.publicKey ?? null
  } catch {
    return null
  }
}

/**
 * Subscreve para Web Push e envia a inscrição para o backend.
 * Retorna true se a inscrição foi criada (ou já existia e está ativa).
 */
export async function subscribeToPushNotifications(): Promise<{
  ok: boolean
  error?: string
}> {
  if (!isPushSupported()) {
    return { ok: false, error: 'Web Push não suportado neste dispositivo/navegador.' }
  }

  const permission = await requestNotificationPermission()
  if (permission !== 'granted') {
    return { ok: false, error: 'Permissão de notificações negada.' }
  }

  const registration = await registerServiceWorker()
  if (!registration) {
    return { ok: false, error: 'Não foi possível registrar o service worker.' }
  }

  await navigator.serviceWorker.ready

  const vapidKey = await resolveVapidPublicKey()
  if (!vapidKey) {
    return { ok: false, error: 'VAPID public key não configurada.' }
  }

  let subscription: PushSubscription
  try {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: toBufferSource(urlBase64ToUint8Array(vapidKey)),
    })
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao subscrever Web Push.',
    }
  }

  // Envia a inscrição para o backend persistir
  try {
    const res = await fetch(`${API_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription.toJSON()),
    })
    if (!res.ok) {
      return { ok: false, error: `Backend rejeitou a inscrição (HTTP ${res.status}).` }
    }
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao registrar no backend.',
    }
  }
}

/**
 * Remove a inscrição local e do backend.
 */
export async function unsubscribeFromPushNotifications(): Promise<{
  ok: boolean
  error?: string
}> {
  if (!isPushSupported()) return { ok: false, error: 'Web Push não suportado.' }
  try {
    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.getSubscription()
    if (sub) {
      const endpoint = sub.endpoint
      await sub.unsubscribe()
      if (API_URL && endpoint) {
        await fetch(
          `${API_URL}/notifications/unsubscribe/${encodeURIComponent(endpoint)}`,
          { method: 'DELETE' },
        ).catch(() => { })
      }
    }
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao cancelar inscrição.',
    }
  }
}

/**
 * Verifica se já existe inscrição ativa de push.
 */
export async function hasPushSubscription(): Promise<boolean> {
  if (!isPushSupported()) return false
  try {
    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.getSubscription()
    return sub !== null
  } catch {
    return false
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
    const active = registration.active || navigator.serviceWorker.controller
    if (active) {
      active.postMessage(payload)
      return { ok: true }
    }
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

/**
 * Agenda uma notificação de teste para daqui a `delayMs` milissegundos.
 * Mantém setTimeout na página como fallback (SW pode ser terminado).
 */
export async function sendScheduledNotification(
  delayMs: number,
): Promise<{ ok: boolean; error?: string; scheduledAt?: number }> {
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

  await navigator.serviceWorker.ready

  const scheduledAt = Date.now() + delayMs
  const payload = {
    type: 'SCHEDULE_NOTIFICATION',
    delayMs,
    title: 'InvestWealth — Notificação Agendada',
    body: `Notificação de teste agendada para ${new Date(scheduledAt).toLocaleTimeString('pt-BR')}.`,
    icon: '/favicon.svg',
    tag: 'investwealth-scheduled',
    scheduledAt,
  }

  try {
    const active = registration.active || navigator.serviceWorker.controller
    if (active) {
      active.postMessage(payload)
    }
    scheduleFromPage(delayMs, payload)
    return { ok: true, scheduledAt }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao agendar a notificação.' }
  }
}

function scheduleFromPage(delayMs: number, payload: SchedulePayload): void {
  setTimeout(() => {
    const active = navigator.serviceWorker?.controller
    if (active) {
      active.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        tag: payload.tag,
      })
    } else {
      try {
        // eslint-disable-next-line no-new
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon,
          tag: payload.tag,
        })
      } catch {
        /* ignore */
      }
    }
  }, delayMs)
}

interface SchedulePayload {
  title: string
  body: string
  icon: string
  tag: string
  scheduledAt: number
}
