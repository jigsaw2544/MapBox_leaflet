import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base:'./',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['react-leaflet-draw-fix.js']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          lodash: ['lodash'],
          react: ['react', 'react-dom'],
          leaflet: ['leaflet'],
          'leaflet-draw': ['leaflet-draw'],
          'leaflet-contextmenu': ['leaflet-contextmenu'],
          'leaflet-editable': ['leaflet-editable'],
          'leaflet-routing-machine': ['leaflet-routing-machine'],
          'lrm-graphhopper': ['lrm-graphhopper'],
          // Add more manual chunking rules as needed
        },
      },
    },
  },
});
