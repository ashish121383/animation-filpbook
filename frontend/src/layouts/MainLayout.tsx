import { motion } from 'framer-motion';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { HealthStatus } from '@/components/HealthStatus';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toolbar } from '@/components/Toolbar';
import { useAppStore } from '@/stores/appStore';

export function MainLayout() {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-surface-dark/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
                Premium OCR Flipbook
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered PDF Experience</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <HealthStatus />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <Toolbar />

      <div className="flex flex-1">
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="hidden overflow-hidden border-r border-gray-200 bg-surface-muted dark:border-gray-800 dark:bg-surface-muted-dark lg:block"
        >
          <div className="w-[280px] p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Navigation
            </h2>
            <nav className="space-y-1">
              <Link
                to="/"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Home
              </Link>
              <Link
                to="/upload"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/upload') || location.pathname.startsWith('/documents')
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Upload PDF
              </Link>
            </nav>
          </div>
        </motion.aside>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      <footer className="border-t border-gray-200 bg-white py-4 dark:border-gray-800 dark:bg-surface-dark">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 dark:text-gray-400 sm:px-6 lg:px-8">
          Premium OCR PDF Flipbook · v{import.meta.env.VITE_APP_VERSION ?? '1.0.0'}
        </div>
      </footer>
    </div>
  );
}
