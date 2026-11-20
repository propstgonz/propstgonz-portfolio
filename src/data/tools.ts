import type { Tool } from '../types/tool';

import webdevLogo from '../assets/img/logo/webdev.svg';
import astroLogo from '../assets/img/logo/astro-icon.png';
import gitLogo from '../assets/img/logo/git-icon.png';
import claudeLogo from '../assets/img/logo/claude.svg';
import filezillaLogo from '../assets/img/logo/FileZilla-icon.png';
import postfixLogo from '../assets/img/logo/postfix.png';
import nginxLogo from '../assets/img/logo/nginx-icon.png';
import apacheLogo from '../assets/img/logo/apache-logo.png';
import dnsLogo from '../assets/img/logo/dns-icon.png';
import dockerLogo from '../assets/img/logo/docker-logo.png';
import jenkinsLogo from '../assets/img/logo/jenkins.svg';
import tuxLogo from '../assets/img/logo/Tux-logo.png';

export const tools: Tool[] = [
  { name: 'Web Development', icon: webdevLogo },
  { name: 'Astro', icon: astroLogo, href: 'https://astro.build' },
  { name: 'Git', icon: gitLogo, href: 'https://git-scm.com' },
  { name: 'Claude Code', icon: claudeLogo, href: 'https://claude.com/claude-code' },
  { name: 'FileZilla', icon: filezillaLogo },
  { name: 'Postfix & Dovecot', icon: postfixLogo },
  { name: 'Nginx', icon: nginxLogo, href: 'https://nginx.org' },
  { name: 'Apache', icon: apacheLogo },
  { name: 'DNS records', icon: dnsLogo },
  { name: 'Docker', icon: dockerLogo, href: 'https://docker.com' },
  { name: 'Jenkins', icon: jenkinsLogo, href: 'https://www.jenkins.io' },
  { name: 'GNU/Linux bash', icon: tuxLogo },
];
