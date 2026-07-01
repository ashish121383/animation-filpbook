import styles from '@/styles/loading.module.css';

interface LoadingOverlayProps {
  progress: number;
  message?: string;
}

export function LoadingOverlay({ progress, message = 'Analyzing PDF...' }: LoadingOverlayProps) {
  return (
    <div className={styles.loadingOverlay} role="alert" aria-busy="true">
      <div className={styles.loadingContent}>
        <div className={styles.loadingSpinner} />
        <p className={styles.loadingMessage}>{message}</p>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${Math.min(progress, 100)}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <span className={styles.progressText}>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
