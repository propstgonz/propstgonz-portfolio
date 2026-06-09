export interface Social {
  label:    string;
  href:     string;
  icon:     string;   // path to /public/icons/svg/*.svg
  external: boolean;
}

export const socials: Social[] = [
  {
    label:    'GitHub',
    href:     'https://github.com/propstgonz',
    icon:     '/icons/svg/github.svg',
    external: true,
  },
  {
    label:    'Discord',
    href:     'https://discord.com/users/propstgonz',
    icon:     '/icons/svg/discord.svg',
    external: true,
  },
  {
    label:    'propstgonz@baronette.es',
    href:     'mailto:propstgonz@baronette.es',
    icon:     '/icons/svg/email.svg',
    external: false,
  },
];
