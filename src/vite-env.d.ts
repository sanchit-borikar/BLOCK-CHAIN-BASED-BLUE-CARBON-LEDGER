/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PROJECT_ID: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_POLYGON_RPC_URL?: string
  readonly VITE_CONTRACT_ADDRESS?: string
  readonly VITE_PINATA_API_KEY?: string
  readonly VITE_PINATA_SECRET_KEY?: string
  readonly VITE_AWS_ANALYTICS_ENDPOINT?: string
  readonly VITE_AWS_REGION?: string
  readonly VITE_MONGODB_URI?: string
  readonly VITE_REDIS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
