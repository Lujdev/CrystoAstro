import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://crystodolarvzla.site/',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    icon(),
    sitemap(),
  ],
});
