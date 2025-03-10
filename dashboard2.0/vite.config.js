import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import jsconfigPaths from 'vite-jsconfig-paths';
import Constants from './src/constants/constants';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: Constants.DASHBOARD_PORT,
  },
  plugins:
    [
      react(),
      {
        name: 'load+transform-js-files-as-jsx',
        async transform(code, id) {
          if (!id.match(/src\/.*\.js$/)) {
            return null;
          }

          // Use the exposed transform from vite, instead of directly
          // transforming with esbuild
          return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic', // 👈 this is important
          });
        },
      },
      tailwindcss(),
      jsconfigPaths()
    ],

  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})
