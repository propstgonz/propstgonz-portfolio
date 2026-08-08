import type { Computer } from '../types/computer';

export const computers: Computer[] = [
  {
    id: 'main-pc',
    name: 'Propstgonz@B650',
    os: 'Windows 11 Pro',
    role: 'Daily driver / Gaming',
    color: '#3B82F6', // Windows blue
    specs: [
      { label: 'Host', value: 'Gigabyte B650 EAGLE' },
      { label: 'CPU', value: 'AMD Ryzen 5 7600X @ 4.69GHz' },
      { label: 'GPU', value: 'AMD Radeon RX 7700 XT' },
      { label: 'RAM', value: '32 GB DDR5 6000 MT/s' },
      { label: 'Disk', value: '1 TB NVMe SSD + 1 TB SSD + 2 TB HDD' },
      { label: 'Kernel', value: '10.0.26200.0' },
      { label: 'Packages', value: '16 (choco)' },
      { label: 'Shell', value: 'PowerShell 5.1.26100.8875' },
      { label: 'Terminal', value: 'Windows Terminal' },
      { label: 'Resolution', value: '1920×1080 + 1920×1080 + 2560×1440' },
    ],
  },

  {
    id: 'laptop',
    name: 'propstgonz@E5470',
    os: 'Arch Linux',
    role: 'Portable workstation',
    color: '#38BDF8', // Arch cyan-blue
    specs: [
      { label: 'Model', value: 'Dell Latitude E5470' },
      { label: 'CPU', value: 'Intel Core i5-6300U @ 3.00GHz' },
      { label: 'GPU', value: 'Intel HD Graphics 520 @ 1.00GHz' },
      { label: 'RAM', value: '8 GB DDR4' },
      { label: 'Disk', value: '250 GB SSD' },
      { label: 'Kernel', value: '7.1.5-arch1-2' },
      { label: 'Packages', value: '8 (flatpak), 830 (pacman)' },
      { label: 'Desktop', value: 'GNOME 50.3 — Mutter (Wayland)' },
      { label: 'Shell', value: 'bash 5.3.15' },
      { label: 'Terminal', value: 'GNOME Console 50.0' },
      { label: 'Resolution', value: '1366×768' },
      { label: 'Local IP', value: '192.168.1.xxx/24 (wlp1s0)' },
    ],
  },

  {
    id: 'server',
    name: 'propstgonz@propstgserver',
    os: 'Ubuntu 26.04 Server LTS (Resolute Raccoon)',
    role: 'Homelab / Self-hosting',
    color: '#E95420', // Ubuntu orange
    specs: [
      { label: 'Host', value: 'JINGSHA X79SE PLUS' },
      { label: 'CPU', value: 'Intel Xeon E5-2660 v2 (10C/20T) @ 3.00GHz' },
      { label: 'GPU', value: 'NVIDIA GeForce GTX 750' },
      { label: 'RAM', value: '32 GB DDR3 ECC' },
      { label: 'Storage', value: '58 GB (/) · 125 GB (/home) · 931 GB RAID (/media/raid, btrfs) · 245 GB (/var)' },
      { label: 'Kernel', value: '7.0.0-29-generic' },
      { label: 'Packages', value: '1412 (dpkg), 3 (snap)' },
      { label: 'Shell', value: 'bash 5.3.9' },
      { label: 'Terminal', value: '/dev/pts/1' },
      { label: 'Stack', value: 'Docker · Traefik · Jenkins · Vaultwarden · Grafana · Prometheus · Mailserver · Game servers · Discord utils · VPN · +More stuff' },
      { label: 'Local IP', value: '192.168.1.xxx/24 (enp6s0)' },
    ],
  },
];
