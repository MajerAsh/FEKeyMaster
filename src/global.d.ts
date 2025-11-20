// Helpful ambient declarations for a gradual TypeScript adoption in the FE

declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg";
declare module "*.mp3";
declare module "*.wav";

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // add other VITE_ env names you rely on here as readonly strings
  readonly NODE_ENV?: "development" | "production" | "test";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
