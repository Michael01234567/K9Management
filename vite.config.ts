import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
            return 'analytics-vendor';
          }
          if (id.includes('jspdf') || id.includes('html2canvas')) {
            return 'pdf-vendor';
          }
          if (id.includes('node_modules/xlsx')) {
            return 'excel-vendor';
          }
          if (id.includes('@supabase')) {
            return 'supabase-vendor';
          }
        },
      },
    },
  },
});
