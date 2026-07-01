import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.BASE_URL,
  headers: {
    'x-api-key': process.env.API_KEY
  },
});
