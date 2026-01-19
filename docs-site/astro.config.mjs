import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://agentic-dev-library.github.io',
  base: '/thumbcode',
  integrations: [
    starlight({
      title: 'ThumbCode',
      description:
        'Code with your thumbs. A decentralized multi-agent mobile development platform.',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: false,
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/agentic-dev-library/thumbcode',
        },
      ],
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'introduction' },
            { label: 'Quick Start', slug: 'quick-start' },
            { label: 'Environment Setup', slug: 'environment-setup' },
          ],
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'API Reference',
          autogenerate: { directory: 'api' },
        },
        {
          label: 'Agent System',
          autogenerate: { directory: 'agents' },
        },
        {
          label: 'Integrations',
          autogenerate: { directory: 'integrations' },
        },
        {
          label: 'Brand',
          items: [{ label: 'Brand Guidelines', slug: 'brand/guidelines' }],
        },
        {
          label: 'About',
          items: [
            { label: 'Vision', slug: 'about/vision' },
            { label: 'Architecture', slug: 'about/architecture' },
            { label: 'Decisions', slug: 'about/decisions' },
          ],
        },
      ],
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.googleapis.com',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossorigin: true,
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Cabin:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;700&display=swap',
          },
        },
      ],
    }),
  ],
});
