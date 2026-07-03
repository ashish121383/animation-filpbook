import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

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
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.cursorvm.com',
      '7329a83fcce90b26c481-pod-uxfjnu5vyjadzfdjn6dfazotfe-5173.us7.cursorvm.com',
    ],
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
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
