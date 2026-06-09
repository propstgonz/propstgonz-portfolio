export interface StuffItem {
  label: string;
  href:  string;
  img?:  string;  // optional background image path
}

export const stuff: StuffItem[] = [
  { label: 'FAQ',            href: '/faq'                         },
  { label: 'Projects',       href: '/projects'                    },
  { label: 'GitHub',         href: 'https://github.com/propstgonz', img: 'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png' },
  { label: 'My first page',  href: 'https://baronette.es',        img: '/trollface.png'   },
];
