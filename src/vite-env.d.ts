/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OAUTH_CLIENT_ID: string
  readonly VITE_SUPABASE_PROJECT_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}