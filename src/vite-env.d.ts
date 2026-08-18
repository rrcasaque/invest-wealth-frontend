/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BRAPI_TOKEN: string
  readonly VITE_API_URL: string
  readonly VITE_VAPID_PUBLIC_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
