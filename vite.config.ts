import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn, ChildProcess } from 'child_process'

let backendProcess: ChildProcess | null = null

// Plugin to start backend server
function backendServerPlugin() {
  return {
    name: 'backend-server',
    configureServer() {
      if (!backendProcess) {
        console.log('🚀 Starting backend server on port 3001...')
        backendProcess = spawn('node', ['build/httpServer.js'], {
          stdio: 'inherit',
          shell: true
        })

        backendProcess.on('error', (err) => {
          console.error('❌ Backend server error:', err)
        })
      }
    },
    closeBundle() {
      if (backendProcess) {
        console.log('🛑 Stopping backend server...')
        backendProcess.kill()
        backendProcess = null
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), backendServerPlugin()],
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})