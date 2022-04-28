import path from 'path';
import prefresh from '@prefresh/vite';
import { UserConfig } from 'vite';

const hmr = +(process.env.HMR ?? 1);

const server = {
  host: '0.0.0.0',
  port: 3000,
  https: {
    cert: './tls/dev.cert',
    key: './tls/dev.key',
  },
  hmr: hmr ? { host: process.env.HOST || 'localhost' } : false,
};

export default {
  base: '/bg1/',
  root: 'src',
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
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
  esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
  server,
  preview: server,
  plugins: hmr ? [prefresh({})] : [],
} as UserConfig;
