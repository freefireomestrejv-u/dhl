import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/etc/clientlibs': {
        target: 'https://www.dhl.com',
        changeOrigin: true,
        secure: false
      },
      '/etc.clientlibs': {
        target: 'https://www.dhl.com',
        changeOrigin: true,
        secure: false
      },
      '/content': {
        target: 'https://www.dhl.com',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'https://www.dhl.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
