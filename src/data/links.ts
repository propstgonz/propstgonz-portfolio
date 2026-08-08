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
];
