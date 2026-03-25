
// Use Vite's import.meta.env for environment variables
// Fallback to production URL if env var not set
export const API_ENDPOINT = import.meta.env.VITE_API_URL || 'https://hrapi.tripa.com.ng/api';

export const Endpoint = {
  SYSTEM_READINESS: `${API_ENDPOINT}/system-complete/readiness`,
  INITIALIZE_SYSTEM: `${API_ENDPOINT}/system-complete/setup-complete`,
  CHECK_INITIALIZATION_STATUS: `${API_ENDPOINT}/system-complete/readiness`,
  INITIALIZE_SYSTEM_NO_MIGRATIONS: `${API_ENDPOINT}/system/initialize`,
};