import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  // GitHub Pages 배포 경로: https://qpzm007.github.io/dcl100l/jk_build/
  // BUILD_TARGET=ghpages npm run build 로 실행 시 base 경로 적용
  const isGHPages = process.env.BUILD_TARGET === 'ghpages';
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    base: isGHPages ? '/dcl100l/jk_build/' : './',
    build: {
      outDir: path.resolve(__dirname, '../jk_build'),
      emptyOutDir: true,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
