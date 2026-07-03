import { useHealthCheck } from '@/api/health';
import { cn, capitalize } from '@/utils/cn';

export function HealthStatus() {
  const { data, isLoading, isError } = useHealthCheck();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400" />
        Checking API...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        API Offline
      </div>
    );
  }

  const statusColors = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    unhealthy: 'bg-red-500',
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <span className={cn('h-2 w-2 rounded-full', statusColors[data.status])} />
      <span>
        API {capitalize(data.status)} · v{data.version}
      </span>
    </div>
  );
}
