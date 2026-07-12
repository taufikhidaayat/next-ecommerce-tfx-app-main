import axios from 'axios';

// `api` dipakai DI SERVER (di dalam route handler app/api) untuk memanggil backend
// NestJS. baseURL = alamat backend (env) dan x-api-key otomatis disertakan (kunci
// rahasia yang diwajibkan ApiKeyMiddleware backend). Karena hanya jalan di server,
// kunci ini tidak pernah sampai ke browser. Pasangannya: apiClient di lib/client.
export const api = axios.create({
  baseURL: process.env.BASE_URL,
  headers: {
    'x-api-key': process.env.API_KEY
  },
});
