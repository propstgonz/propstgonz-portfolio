import type { Computer } from '../types/computer';

export const computers: Computer[] = [
  {
    id: 'main',
    name: 'main-rig',
    os: 'Arch Linux x86_64',
    role: 'Daily driver',
    color: '#E8943A',
    specs: [
      { label: 'CPU', value: 'AMD Ryzen 5 5600X' },
      { label: 'GPU', value: 'NVIDIA RTX 3060' },
      { label: 'RAM', value: '32 GB DDR4 3200MHz' },
      { label: 'Disk', value: '1TB NVMe SSD + 2TB HDD' },
      { label: 'Shell', value: 'zsh + oh-my-zsh' },
      { label: 'WM', value: 'Hyprland' },
      { label: 'Term', value: 'Kitty' },
    ],
  },
  {
    id: 'laptop',
    name: 'laptop',
    os: 'Ubuntu 24.04 LTS',
    role: 'Portability / uni',
    color: '#38BDF8',
    specs: [
      { label: 'Model', value: 'Lenovo ThinkPad' },
      { label: 'CPU', value: 'Intel Core i5' },
      { label: 'RAM', value: '16 GB DDR4' },
      { label: 'Disk', value: '512 GB SSD' },
      { label: 'Shell', value: 'bash' },
    ],
  },
  {
    id: 'server',
    name: 'baronette-srv',
    os: 'Debian 12 (headless)',
    role: 'Home server — hosts this site',
    color: '#4ADE80',
    specs: [
      { label: 'CPU', value: 'Intel Core i3' },
      { label: 'RAM', value: '8 GB DDR4' },
      { label: 'Disk', value: '256 GB SSD + 4 TB HDD' },
      { label: 'Stack', value: 'Docker + Traefik + Jenkins' },
      { label: 'Uptime', value: '99.1% (Jenkins excluded)' },
    ],
  },
];
