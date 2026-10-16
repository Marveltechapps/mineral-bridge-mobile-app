import { API_BASE_URL, API_TIMEOUT_MS } from '@env';

/** Runtime configuration from `.env` (public values only — never secrets). */
export const env = {
  API_BASE_URL: (API_BASE_URL ?? '').replace(/\/$/, ''),
  API_TIMEOUT_MS: Number(API_TIMEOUT_MS) || 15000,
};
