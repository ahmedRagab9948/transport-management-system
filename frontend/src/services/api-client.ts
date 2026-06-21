import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
