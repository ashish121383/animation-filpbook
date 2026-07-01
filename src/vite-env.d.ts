/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_VISION_API_KEY: string;
  readonly VITE_AZURE_VISION_ENDPOINT: string;
  readonly VITE_AZURE_VISION_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
