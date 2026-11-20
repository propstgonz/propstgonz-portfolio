import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://propstgonz.baronette.es',
  output: 'server',
  security: { checkOrigin: false },
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.BUILD_DATE': JSON.stringify(new Date().toISOString().slice(0, 10)),
    },
  },
});
