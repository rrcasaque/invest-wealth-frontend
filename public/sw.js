/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

/**
 * InvestWealth Service Worker
 *
 * Responsabilidades:
 *  1. App shell cache (permite instalação como PWA + uso offline básico)
 *  2. Mostrar notificações do sistema via `showNotification`
 *     (disparadas por mensagem postada pela app)
 */

const CACHE_VERSION = 'investwealth-v1'
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  // Network-first para navegação; fallback para cache offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_VERSION).then((cache) => cache.put('/index.html', copy))
          return response
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/'))),
    )
    return
  }

  // Cache-first para assets estáticos (mesma origem)
  if (new URL(request.url).origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone()
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy))
          }
          return response
        })
      }),
    )
  }
})

/**
 * Recebe mensagens da aplicação para disparar notificações do sistema.
 *
 * Tipos suportados:
 *  - SHOW_NOTIFICATION: exibe imediatamente
 *    payload: { type, title, body?, icon?, tag? }
 *  - SCHEDULE_NOTIFICATION: agenda exibição para daqui a delayMs
 *    payload: { type, delayMs, title, body?, icon?, tag?, scheduledAt }
 */
self.addEventListener('message', (event) => {
  const data = event.data
  if (!data) return

  if (data.type === 'SHOW_NOTIFICATION') {
    showNotificationNow(data)
    return
  }

  if (data.type === 'SCHEDULE_NOTIFICATION') {
    const delay = Number(data.delayMs) || 0
    if (delay <= 0) {
      showNotificationNow(data)
      return
    }
    // Agenda no próprio SW. O navegador pode terminar o SW inativo antes
    // do timer disparar; a página mantém um fallback paralelo.
    setTimeout(() => showNotificationNow(data), delay)
  }
})

function showNotificationNow(data) {
  const { title, body = '', icon = '/favicon.svg', tag = 'investwealth-test' } = data
  self.registration
    .showNotification(title, {
      body,
      icon,
      badge: icon,
      tag,
      requireInteraction: false,
      data: { timestamp: Date.now() },
    })
    .catch((err) => {
      console.error('[sw] falha ao exibir notificação:', err)
    })
}

// Fecha notificações ao clicar e foca a janela do app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow('/')
      return null
    }),
  )
})

/**
 * Web Push: disparado pelo navegador quando o backend envia um push
 * (via FCM/Mozilla). Funciona com app fechado — o navegador acorda o SW.
 *
 * O payload (enviado pelo backend) é um JSON com:
 *   { title, body?, icon?, tag?, data? }
 */
self.addEventListener('push', (event) => {
  let payload = { title: 'InvestWealth', body: '', icon: '/favicon.svg', tag: 'investwealth' }
  try {
    if (event.data) {
      const parsed = event.data.json()
      payload = { ...payload, ...parsed }
    }
  } catch {
    // payload não-JSON; usa texto como body
    if (event.data) {
      payload.body = event.data.text()
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.icon,
      tag: payload.tag,
      data: payload.data ?? { timestamp: Date.now() },
      requireInteraction: false,
    }),
  )
})
