import axios from "axios";

// apiClient dipakai komponen/hook di BROWSER (toko pelanggan). baseURL '/api' menunjuk
// ke route handler Next.js sendiri (folder app/api), bukan langsung ke backend NestJS.
// Pola BFF sama seperti di CMS: browser → API route Next.js → backend, agar api-key
// & token tetap aman di server. Pasangannya: `api` di lib/axios.ts.
export const apiClient = axios.create({
    baseURL: '/api',
});