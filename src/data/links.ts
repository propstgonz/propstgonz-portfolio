import type { LinkCategory } from '../types/link';

export const linkCategories: LinkCategory[] = [
  {
    name: 'my stuff',
    items: [
      { label: 'GitHub', href: 'https://github.com/propstgonz', description: 'All my repos and projects.' },
      { label: 'baronette.es', href: 'https://baronette.es', description: 'My first ever page. Still up, out of nostalgia.' },
      { label: 'localhost', href: 'http://localhost', description: 'My first website ;D.' },
    ],
  },
  {
    name: 'Other stuff I like',
    items: [
      { label: 'Gran Maris', href: 'https://discord.gg/Q7zdDHNGGK', description: 'Random Discord server where got friends there 24/7.' },
      
    ],
  },
];
