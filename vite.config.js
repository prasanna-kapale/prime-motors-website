import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        admin:   resolve(__dirname, 'admin.html'),
        manager: resolve(__dirname, 'manager.html'),
        invoice: resolve(__dirname, 'invoice.html'),
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
