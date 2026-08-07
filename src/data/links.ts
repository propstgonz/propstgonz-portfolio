import type { LinkCategory } from '../types/link';

// Edit freely — add/remove categories and items as you like.
export const linkCategories: LinkCategory[] = [
  {
    name: 'my stuff',
    items: [
      { label: 'GitHub', href: 'https://github.com/propstgonz', description: 'All my repos and projects.' },
      { label: 'baronette.es', href: 'https://baronette.es', description: 'My first ever page. Still up, out of nostalgia.' },
    ],
  },
  {
    name: 'videos',
    items: [
      // e.g. { label: 'Some YouTube channel', href: 'https://youtube.com/...', description: 'Why I like it.' },
    ],
  },
  {
    name: 'tools & docs',
    items: [
      { label: 'Astro docs', href: 'https://docs.astro.build', description: 'The docs I have open in a tab right now.' },
      { label: 'Arch Wiki', href: 'https://wiki.archlinux.org', description: 'The answer to 90% of my problems.' },
    ],
  },
];
