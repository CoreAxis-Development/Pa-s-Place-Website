// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // Every page is rendered on request: content comes from the database, so
  // an edit in the admin portal is live immediately, with no rebuild.
  output: 'server',

  // Reject cross-site form posts (CSRF) on every non-GET request.
  security: { checkOrigin: true },

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      // native / wasm packages must be loaded from node_modules, not bundled
      external: ['@electric-sql/pglite', 'postgres', 'sharp', 'nodemailer'],
    },
  },

  adapter: node({
    mode: 'standalone',
  }),

  integrations: [react()],
});
