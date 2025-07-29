import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import type { ConfigEnv } from 'vite';

// https://vitejs.dev/config/
export default ({ mode }: ConfigEnv) => {
  // Cargar variables de entorno basadas en el modo (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    plugins: [
      react(),
      tsconfigPaths(),
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      port: 5174,
      strictPort: true,
      proxy: {
        // Proxy para la API
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        // Proxy para WebSocket si es necesario
        '/ws': {
          target: env.VITE_WS_URL || 'ws://localhost:8001',
          ws: true
        }
      }
    },
    // Definir variables de entorno accesibles en el cliente
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:8001'),
      'import.meta.env.VITE_WS_URL': JSON.stringify(env.VITE_WS_URL || 'ws://localhost:8001')
    }
  });
};
