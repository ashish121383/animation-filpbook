import { motion } from 'framer-motion';
import { useHealthCheck } from '@/api/health';
import { LoadingScreen } from '@/components/LoadingScreen';
import { capitalize } from '@/utils/cn';

const features = [
  {
    title: 'AI-Powered OCR',
    description: 'Extract text, layout, tables, charts, and more with multi-engine OCR pipeline.',
    icon: '🤖',
  },
  {
    title: 'Premium Page Flip',
    description: 'Realistic magazine experience with GPU-accelerated page curl animations.',
    icon: '📖',
  },
  {
    title: 'Object Animations',
    description: 'Every detected element animates independently after page flip completes.',
    icon: '✨',
  },
  {
    title: 'Enterprise Performance',
    description: 'Virtual scrolling, lazy loading, and IndexedDB cache for 500+ page PDFs.',
    icon: '⚡',
  },
];

export function HomePage() {
  const { data: health, isLoading } = useHealthCheck();

  if (isLoading) {
    return <LoadingScreen message="Connecting to API..." fullScreen={false} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h2 className="font-display mb-4 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
          Premium AI OCR PDF Flipbook
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Transform static PDFs into interactive, animated flipbook experiences with
          enterprise-grade OCR and layout analysis.
        </p>
      </motion.section>

      {health && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mb-12"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            System Status
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatusCard label="API Status" value={capitalize(health.status)} />
            <StatusCard label="Version" value={health.version} />
            <StatusCard label="Environment" value={capitalize(health.environment)} />
            <StatusCard
              label="Database"
              value={capitalize(health.services.database.status)}
              isHealthy={health.services.database.status === 'healthy'}
            />
          </div>
        </motion.div>
      )}

      <section className="grid gap-6 sm:grid-cols-2">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 3) }}
            className="card group transition-shadow hover:shadow-md"
          >
            <div className="mb-3 text-3xl">{feature.icon}</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
          </motion.div>
        ))}
      </section>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center"
      >
        <button type="button" className="btn-primary px-8 py-3 text-base" disabled>
          Upload PDF (Module 2)
        </button>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          PDF upload and OCR pipeline will be available in Module 2
        </p>
      </motion.div>
    </div>
  );
}

interface StatusCardProps {
  label: string;
  value: string;
  isHealthy?: boolean;
}

function StatusCard({ label, value, isHealthy }: StatusCardProps) {
  return (
    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-semibold ${
          isHealthy === false
            ? 'text-yellow-600 dark:text-yellow-400'
            : isHealthy === true
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-900 dark:text-white'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
