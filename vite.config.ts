import path from 'path';
import { defineConfig } from 'vite';
import prefresh from '@prefresh/vite';

const server = {
  host: '0.0.0.0',
  port: 3000,
  https: {
    cert: './tls/dev.cert',
    key: './tls/dev.key',
  },
};

export default defineConfig({
  base: '/bg01/',
  root: 'src',
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      '@/': path.join(__dirname, 'src') + '/',
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: false,
    rollupOptions: {
      input: ['src/bg01.tsx', 'src/bg01.css'],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
    },
  },
  optimizeDeps: { include: ['preact', 'preact/hooks', 'preact/compat'] },
  esbuild: {
    charset: 'ascii',
    jsxInject: `import * as React from 'react'`,
  },
  server,
  preview: server,
  plugins: [prefresh()],
});
