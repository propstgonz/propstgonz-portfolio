import type { Computer } from '../types/computer';

export const computers: Computer[] = [
  {
    id: 'main-pc',
    name: 'Propstgonz@B650',
    os: 'Windows 11 Pro',
    role: 'Daily driver / Gaming',
    color: '#E8943A',
    specs: [
      { label: 'Host', value: 'Gigabyte B650 EAGLE' },
      { label: 'CPU', value: 'AMD Ryzen 5 7600X' },
      { label: 'GPU', value: 'AMD Radeon RX 7700 XT' },
      { label: 'RAM', value: '32 GB DDR5 6000 MT/s' },
      { label: 'Disk', value: '1 TB NVMe SSD' },
      { label: 'Shell', value: 'PowerShell 7.5.4' },
      { label: 'Terminal', value: 'Windows Console' },
      { label: 'Resolution', value: '1920×1080 + 1920×1080 + 2560×1440' },
      { label: 'Kernel', value: '10.0.26100.0' },
    ],
  },

  {
    id: 'laptop',
    name: 'propstgonz@E5470',
    os: 'Fedora Linux 43 (KDE Plasma)',
    role: 'Portable workstation',
    color: '#38BDF8',
    specs: [
      { label: 'Model', value: 'Dell Latitude E5470' },
      { label: 'CPU', value: 'Intel Core i5-6300U' },
      { label: 'GPU', value: 'Intel HD Graphics 520' },
      { label: 'RAM', value: '8 GB DDR4' },
      { label: 'Kernel', value: '6.17.12-300.fc43.x86_64' },
      { label: 'Desktop', value: 'KDE Plasma 6.5.4 (Wayland)' },
      { label: 'Shell', value: 'zsh 5.9' },
      { label: 'Terminal', value: 'Tilix' },
      { label: 'Resolution', value: '1366×768' },
    ],
  },

  {
    id: 'server',
    name: 'propstgonz@propstgserver',
    os: 'Fedora Linux 43 (Server Edition)',
    role: 'Homelab / Self-hosting',
    color: '#4ADE80',
    specs: [
      { label: 'Host', value: 'JINGSHA X79SE PLUS' },
      { label: 'CPU', value: 'Intel Xeon E5-2660 v2 (10C/20T)' },
      { label: 'GPU', value: 'NVIDIA GeForce GTX 750' },
      { label: 'RAM', value: '32 GB DDR3 ECC' },
      { label: 'Kernel', value: '6.17.10-300.fc43.x86_64' },
      { label: 'Shell', value: 'zsh 5.9' },
      { label: 'Stack', value: 'Docker · Traefik · Jenkins · Vaultwarden · Grafana · Prometheus' },
      { label: 'Terminal', value: '/dev/pts/0' },
    ],
  },
];