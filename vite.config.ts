import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is explicitly disabled to avoid WebSocket handshake failure on Cloud Run proxies
      hmr: false,
      // Disable file watching to prevent CPU spikes
      watch: null,
    },
  };
});
