import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    allowedHosts: [
      'frontend-service',
      'localhost',
      '127.0.0.1'
    ],
    host: '127.0.0.1',
    port: 5173
  }
})
