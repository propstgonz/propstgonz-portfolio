export interface Tool {
  name: string;
  href?: string;
}

export const tools: Tool[] = [
  { name: 'TypeScript', href: 'https://typescriptlang.org' },
  { name: 'Astro',      href: 'https://astro.build'        },
  { name: 'Docker',     href: 'https://docker.com'         },
  { name: 'Express',    href: 'https://expressjs.com'      },
  { name: 'Linux',                                          },
  { name: 'Tailwind',   href: 'https://tailwindcss.com'    },
  { name: 'Prisma',     href: 'https://prisma.io'          },
  { name: 'MongoDB',    href: 'https://mongodb.com'        },
  { name: 'Nginx',                                          },
  { name: 'Jenkins',    href: 'https://jenkins.io'         },
  { name: 'Traefik',    href: 'https://traefik.io'         },
];
