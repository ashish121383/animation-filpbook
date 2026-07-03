import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

export interface HealthServiceStatus {
  status: 'healthy' | 'unhealthy';
  message: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  environment: string;
  timestamp: string;
  services: {
    database: HealthServiceStatus;
    redis: HealthServiceStatus;
  };
}

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>('/health');
  return data;
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
  });
}
