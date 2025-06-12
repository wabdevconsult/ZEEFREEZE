// vite.config.ts

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  // Ne conserver que les variables qui commencent par VITE_
  const viteEnv = Object.keys(env)
    .filter((key) => key.startsWith('VITE_'))
    .reduce((acc, key) => {
      acc[`import.meta.env.${key}`] = JSON.stringify(env[key]);
      return acc;
    }, {} as Record<string, string>);

  const apiUrl = env.VITE_API_URL || 'http://15.236.206.129:7500';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    define: {
      ...viteEnv,
      'process.env': {}, // optionnel, pour compatibilité certains packages
    },
  };
});
