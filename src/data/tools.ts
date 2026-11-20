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
import serversLogo from '../assets/img/logo/servers.svg';
import windowsServerLogo from '../assets/img/logo/windows-server-icon.png';
import powershellLogo from '../assets/img/logo/powershell.png';
import hardwareLogo from '../assets/img/logo/hardware.svg';
import ciscoLogo from '../assets/img/logo/cisco.svg';
import podmanLogo from '../assets/img/logo/podman.svg';
import dbeaverLogo from '../assets/img/logo/dbeaver.svg';
import grafanaLogo from '../assets/img/logo/grafana.svg';
import prometheusLogo from '../assets/img/logo/prometheus.svg';

export const tools: Tool[] = [
  { name: 'GNU/Linux bash', icon: tuxLogo },
  { name: 'Debian / Ubuntu / Arch', icon: serversLogo },
  { name: 'Windows Server', icon: windowsServerLogo },
  { name: 'PowerShell', icon: powershellLogo },
  { name: 'Hardware diagnostics', icon: hardwareLogo },
  { name: 'Cisco IOS', icon: ciscoLogo, href: 'https://www.cisco.com/c/en/us/products/ios-nx-os-software/index.html' },
  { name: 'DNS records', icon: dnsLogo },
  { name: 'Nginx', icon: nginxLogo, href: 'https://nginx.org' },
  { name: 'Apache', icon: apacheLogo },
  { name: 'Postfix & Dovecot', icon: postfixLogo },
  { name: 'FileZilla', icon: filezillaLogo },
  { name: 'DBeaver', icon: dbeaverLogo, href: 'https://dbeaver.io' },
  { name: 'Docker', icon: dockerLogo, href: 'https://docker.com' },
  { name: 'Podman', icon: podmanLogo, href: 'https://podman.io' },
  { name: 'Jenkins', icon: jenkinsLogo, href: 'https://www.jenkins.io' },
  { name: 'Grafana', icon: grafanaLogo, href: 'https://grafana.com' },
  { name: 'Prometheus', icon: prometheusLogo, href: 'https://prometheus.io' },
  { name: 'Git', icon: gitLogo, href: 'https://git-scm.com' },
  { name: 'Web Development', icon: webdevLogo },
  { name: 'Astro', icon: astroLogo, href: 'https://astro.build' },
  { name: 'Claude Code', icon: claudeLogo, href: 'https://claude.com/claude-code' },
];
