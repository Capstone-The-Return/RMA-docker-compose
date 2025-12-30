import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  watch: { 
    usePolling: true, 
    interval: 100 
  }, 
  host: "0.0.0.0",
})
