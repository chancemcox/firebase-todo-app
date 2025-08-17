const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  css: {
    postcss: './postcss.config.js',
    modules: false,
    devSourcemap: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
