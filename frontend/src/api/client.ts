import axios, { type AxiosError, type AxiosInstance } from 'axios';

// Always use relative API path so requests route through Vite proxy in cloud/remote environments
const API_BASE_URL = '/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    const message =
      error.response?.data?.detail ?? error.message ?? 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
