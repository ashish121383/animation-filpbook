import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const isCloud = Boolean(process.env.CURSOR_AGENT || process.env.CLOUD_AGENT);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Allow all hosts in cloud/remote environments (Cursor VM URLs change per pod)
    allowedHosts: isCloud ? true : ['localhost', '127.0.0.1', '.cursorvm.com'],
    hmr: isCloud
      ? {
          protocol: 'wss',
          clientPort: 443,
        }
      : undefined,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          animation: ['framer-motion', 'gsap'],
          pdf: ['pdfjs-dist'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'axios'],
  },
});
