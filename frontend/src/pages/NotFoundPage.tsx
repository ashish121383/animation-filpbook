import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display mb-2 text-6xl font-bold text-gray-900 dark:text-white">404</h1>
      <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">Page not found</p>
      <Link to="/" className="btn-primary">
        Return Home
      </Link>
    </div>
  );
}
