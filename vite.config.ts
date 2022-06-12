import path from 'path';
import prefresh from '@prefresh/vite';
import { UserConfig } from 'vite';

const hmr = +(process.env.HMR ?? 0);

const server = {
  host: '0.0.0.0',
  port: 3000,
  https: {
    cert: './tls/dev.cert',
    key: './tls/dev.key',
  },
  hmr: hmr && { host: process.env.HOST || 'localhost' },
};

export default {
  base: '/bg1/',
  root: 'src',
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      '/': path.join(__dirname, 'src') + '/',
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: false,
    rollupOptions: {
      input: ['src/bg1.tsx', 'src/bg1.css'],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
        manualChunks: {},
      },
    },
  },
  esbuild: { jsxInject: `import * as React from 'react'` },
  server,
  preview: server,
  plugins: [hmr && prefresh()],
} as UserConfig;
