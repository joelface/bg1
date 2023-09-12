import prefresh from '@prefresh/vite';
import path from 'path';
import { defineConfig } from 'vite';
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator';

const server = {
  host: '0.0.0.0',
  port: 3000,
  https: {
    cert: './tls/dev.cert',
    key: './tls/dev.key',
  },
};

export default defineConfig({
  base: '/bg1/',
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
      input: ['src/bg1.tsx', 'src/bg1.css'],
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
  plugins: [
    obfuscatorPlugin({
      include: ['src/api/diu/*'],
      apply: 'build',
      options: {
        seed: 1,
        splitStrings: true,
        stringArrayThreshold: 1,
        stringArrayEncoding: ['base64'],
      },
    }),
    +(process.env.HMR ?? 0) ? prefresh() : null,
  ],
});
