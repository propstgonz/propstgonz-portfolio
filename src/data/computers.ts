export const computers = [
  {
    id: 'main-pc',
    name: 'Propstgonz@B650',
    ascii: `
        PS C:\Users\Propst> winfetch

        lllllllllllllll   lllllllllllllll  Propst@B650
        lllllllllllllll   lllllllllllllll  -----------
        lllllllllllllll   lllllllllllllll  OS: Windows 11 Pro [64 bits]
        lllllllllllllll   lllllllllllllll  Host: Gigabyte Technology Co., Ltd. B650 EAGLE
        lllllllllllllll   lllllllllllllll  Kernel: 10.0.26100.0
        lllllllllllllll   lllllllllllllll  Motherboard: Gigabyte Technology Co., Ltd. B650 EAGLE
        lllllllllllllll   lllllllllllllll  Uptime: 27 minutes
                                           Packages: (none)
        lllllllllllllll   lllllllllllllll  Shell: PowerShell v7.5.4
        lllllllllllllll   lllllllllllllll  Resolution: 1920x1080, 1920x1080, 2560x1440*
        lllllllllllllll   lllllllllllllll  Terminal: Windows Console
        lllllllllllllll   lllllllllllllll  CPU: AMD Ryzen 5 7600X 6-Core Processor
        lllllllllllllll   lllllllllllllll  GPU: AMD Radeon RX 7700 XT
        lllllllllllllll   lllllllllllllll  Memory: 10,94 GiB / 31,61 GiB (34%)
        lllllllllllllll   lllllllllllllll  Disk (C:): 118 GiB / 930 GiB (12%)
    `,
    specs: {
      Host: 'Gigabyte Technology Co., Ltd. B650 EAGLE',
      OS: 'Windows 11 Pro [64 bits]',
      Kernel: '10.0.26100.0',
      Motherboard: 'Gigabyte Technology Co., Ltd. B650 EAGLE',
      Uptime: '27 minutes',
      Packages: '(none)',
      Shell: 'PowerShell v7.5.4',
      Resolution: '1920x1080, 1920x1080, 2560x1440',
      Terminal: 'Windows Console',
      CPU: 'AMD Ryzen 5 7600X 6-Core Processor',
      GPU: 'AMD Radeon RX 7700 XT',
      RAM: '10.94 / 31.61 GiB (34%)',
      Disk: '118 / 930 GiB (12%)',
    },
  },
  {
    id: 'laptop',
    name: 'propstgonz@E5470',
    ascii: `
               .',;::::;,'.              propstgonz@E5470
         .';:cccccccccccc:;,.            ----------------- 
      .;cccccccccccccccccccccc;.         OS: Fedora Linux 43 (KDE Plasma Desktop)
    .:cccccccccccccccccccccccccc:.       Host: Latitude E5470
  .;ccccccccccccc;.:dddl:.;ccccccc;.     Kernel: 6.17.12-300.fc43.x86_64 
 .:ccccccccccccc;OWMKOOXMWd;ccccccc:.    Uptime: 1 hour, 8 mins 
.:ccccccccccccc;KMMc;cc;xMMc;ccccccc:.   Packages: 2544 (rpm), 18 (flatpak) 
,cccccccccccccc;MMM.;cc;;WW:;cccccccc,   Shell: zsh 5.9 
:cccccccccccccc;MMM.;cccccccccccccccc:   Resolution: 1366x768 
:ccccccc;oxOOOo;MMM0OOk.;cccccccccccc:   DE: Plasma 6.5.4 (Wayland) 
cccccc;0MMKxdd:;MMMkddc.;cccccccccccc;   WM: kwin_wayland_wr 
ccccc;XM0';cccc;MMM.;cccccccccccccccc'   Theme: Breeze-Dark [GTK2], Breeze [GTK 
ccccc;MMo;ccccc;MMW.;ccccccccccccccc;    Icons: Tela-ubuntu-dark [GTK2/3] 
ccccc;0MNc.ccc.xMMd;ccccccccccccccc;     Terminal: tilix 
cccccc;dNMWXXXWM0:;cccccccccccccc:,      CPU: Intel i5-6300U (4) @ 3.000GHz 
cccccccc;.:odl:.;cccccccccccccc:,.       GPU: Intel Skylake GT2 [HD Graphics 520] 
:cccccccccccccccccccccccccccc:'.         Memory: 5449MiB / 7816MiB 
.:cccccccccccccccccccccc:;,..
  '::cccccccccccccc::;,.
    `,
    specs: {
      Host: 'Latitude E5470',
      OS: 'Fedora Linux 43 (KDE Plasma Desktop)',
      Kernel: '6.17.12-300.fc43.x86_64',
      Uptime: '1 hour, 8 mins',
      Packages: '2544 (rpm), 18 (flatpak)',
      Shell: 'zsh 5.9',
      Resolution: '1366x768',
      DE: 'Plasma 6.5.4 (Wayland)',
      WM: 'kwin_wayland_wr',
      Terminal: 'tilix',
      CPU: 'Intel i5-6300U (4) @ 3.000GHz',
      GPU: 'Intel Skylake GT2 [HD Graphics 520]',
      RAM: '5449MiB / 7816MiB',
    },
  },
  {
    id: 'server',
    name: 'propstgonz@propstgserver',
    ascii: `
              .',;::::;,'.                propstgonz@propstgserver
          .';:cccccccccccc:;,.            ------------------------
        .;cccccccccccccccccccccc;.         OS: Fedora Linux 43 (Server Edition) x86_64
      .:cccccccccccccccccccccccccc:.       Host: JINGSHA X79SE PLUS
    .;ccccccccccccc;.:dddl:.;ccccccc;.     Kernel: 6.17.10-300.fc43.x86_64
  .:ccccccccccccc;OWMKOOXMWd;ccccccc:.     Uptime: 18 hours, 52 mins
  .:ccccccccccccc;KMMc;cc;xMMc;ccccccc:.   Packages: 927 (rpm)
  ,cccccccccccccc;MMM.;cc;;WW:;cccccccc,   Shell: zsh 5.9
  :cccccccccccccc;MMM.;cccccccccccccccc:   Terminal: /dev/pts/0
  :ccccccc;oxOOOo;MMM0OOk.;cccccccccccc:   CPU: Intel Xeon E5-2660 v2 (20) @ 3.000GHz
  cccccc;0MMKxdd:;MMMkddc.;cccccccccccc;   GPU: NVIDIA GeForce GTX 750
  ccccc;XM0';cccc;MMM.;cccccccccccccccc'   Memory: 26707MiB / 31993MiB
  ccccc;MMo;ccccc;MMW.;ccccccccccccccc;
  ccccc;0MNc.ccc.xMMd;ccccccccccccccc;
  cccccc;dNMWXXXWM0:;cccccccccccccc:,
  cccccccc;.:odl:.;cccccccccccccc:,.
  :cccccccccccccccccccccccccccc:'.
  .:cccccccccccccccccccccc:;,..
    '::cccccccccccccc::;,.      
    `,
    specs: {
      Host: 'JINGSHA X79SE PLUS',
      OS: 'Fedora Linux 43 (Server Edition) x86_64',
      Kernel: '6.17.10-300.fc43.x86_64',
      Uptime: '18 hours, 52 mins',
      Packages: '927 (rpm)',
      Shell: 'zsh 5.9',
      Terminal: '/dev/pts/0',
      CPU: 'Intel Xeon E5-2660 v2 (20) @ 3.000GHz',
      GPU: 'NVIDIA GeForce GTX 750',
      RAM: '26707MiB / 31993MiB',
    },
  },
];
