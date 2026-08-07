import type { Tool } from '../types/tool';

import htmlLogo from '../assets/img/logo/html-logo.png';
import tailwindLogo from '../assets/img/logo/tailwindcss-icon.png';
import astroLogo from '../assets/img/logo/astro-icon.png';
import jsLogo from '../assets/img/logo/javascript-logo.png';
import gitLogo from '../assets/img/logo/git-icon.png';
import filezillaLogo from '../assets/img/logo/FileZilla-icon.png';
import postfixLogo from '../assets/img/logo/postfix.png';
import nginxLogo from '../assets/img/logo/nginx-icon.png';
import apacheLogo from '../assets/img/logo/apache-logo.png';
import dnsLogo from '../assets/img/logo/dns-icon.png';
import dockerLogo from '../assets/img/logo/docker-logo.png';
import tuxLogo from '../assets/img/logo/Tux-logo.png';

export const tools: Tool[] = [
  { name: 'HTML', icon: htmlLogo },
  { name: 'TailwindCSS', icon: tailwindLogo, href: 'https://tailwindcss.com' },
  { name: 'Astro', icon: astroLogo, href: 'https://astro.build' },
  { name: 'JavaScript', icon: jsLogo },
  { name: 'Git', icon: gitLogo, href: 'https://git-scm.com' },
  { name: 'FileZilla', icon: filezillaLogo },
  { name: 'Postfix & Dovecot', icon: postfixLogo },
  { name: 'Nginx', icon: nginxLogo, href: 'https://nginx.org' },
  { name: 'Apache', icon: apacheLogo },
  { name: 'DNS records', icon: dnsLogo },
  { name: 'Docker', icon: dockerLogo, href: 'https://docker.com' },
  { name: 'GNU/Linux bash', icon: tuxLogo },
];
