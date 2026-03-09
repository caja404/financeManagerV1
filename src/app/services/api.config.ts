const localhostApi = 'http://localhost:4000/api/v1';

export const API_BASE_URL =
  globalThis.location.hostname === 'localhost' ? localhostApi : '/api/v1';