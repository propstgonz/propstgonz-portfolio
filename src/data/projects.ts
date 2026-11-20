import type { Project } from '../types/project';

export const projects: Project[] = [
  {
    "name": "Playlist2MP3",
    "tagline": "Keeps folders of MP3s in sync with your Spotify playlists, running quietly in the background.",
    "description": "Playlists live online, but sometimes you want the actual files on your computer, and keeping them up to date by hand is a chore. Playlist2MP3 checks your public Spotify playlists on a schedule, downloads the songs that are missing and, if you want, removes the ones you took out. You list your playlists in one config file, start it with a single Docker command, and it takes care of the rest.",
    "highlights": [
      "It aims for the same version you hear on Spotify, rejecting live takes, covers, remixes, karaoke and sped-up edits.",
      "Mirror mode keeps an exact copy; incremental mode only adds songs, and it only ever deletes files it downloaded itself.",
      "Candidates are searched on YouTube Music with yt-dlp, then scored on title, artist and duration before ffmpeg converts the audio to MP3."
    ],
    "stack": [
      "TypeScript",
      "Node.js",
      "Docker",
      "yt-dlp",
      "ffmpeg",
      "GitHub Actions"
    ],
    "repo": "https://github.com/propstgonz/Playlist2MP3"
  },
  {
    "name": "WinPla",
    "tagline": "Puts your apps' windows on the monitor you choose every time you sign in to Windows.",
    "description": "You tell WinPla which programs go on which monitor and how (maximized, normal size or an exact position). When you sign in, it watches for those windows for a few minutes, puts them where you said, and closes itself, so nothing stays running in the background.",
    "highlights": [
      "Set it once in a small window, with one rule per program, and your layout is back after every sign-in.",
      "It keeps nudging a window until it stays put, because many programs restore their own old position right after opening.",
      "It runs as a PowerShell 7 script that compiles its own C# on start, because Windows 11 Smart App Control can block a home-built .exe."
    ],
    "stack": [
      "C#",
      "PowerShell 7",
      "WPF",
      "Win32 API",
      "Batch"
    ],
    "repo": "https://github.com/propstgonz/winpla-manager"
  },
  {
    "name": "propstgonz.baronette.es",
    "tagline": "This very website: my portfolio, with a live counter, a blog and a contact form.",
    "description": "The site you're on right now, built from scratch instead of from a template. It is two projects working together: the website itself, and a small separate service that supplies the blog posts. Yes, I've broken it in production a few times, and the docs in the repo list the bugs and how I fixed them.",
    "highlights": [
      "The click counter on the homepage is one number shared by everyone, and it ticks up live on all open tabs.",
      "Visitor stats are opt-in only: nothing is counted unless you accept, and a summary reaches me as a weekly email.",
      "Blog posts are plain Markdown text turned into a page by a renderer I wrote myself that strips out anything unsafe."
    ],
    "stack": [
      "Astro",
      "Tailwind CSS",
      "Node.js",
      "Express",
      "MongoDB",
      "Docker"
    ],
    "repo": "https://github.com/propstgonz/propstgonz-portfolio",
    "extraRepo": "https://github.com/propstgonz/propstgonz-portfolio-backend",
    "live": "https://propstgonz.baronette.es"
  },
  {
    "name": "perezpladur.com",
    "tagline": "Website for a family drywall, plaster and renovation company in Barcelona",
    "description": "Website for Pérez Pladur y Yeso, a family business that does home and shop renovations, drywall and plastering around Barcelona. It's a single-page site that lists the services, explains how a job works and lets people ask for a free quote. It runs in Spanish, Catalan and English.",
    "highlights": [
      "Visitors can request a quote by contact form, phone call or WhatsApp straight from the page.",
      "Everything is in Spanish, Catalan and English, with the language switch in the header.",
      "Built with Astro: self-hosted font, mobile-friendly layout, per-language meta tags and a spam-trap field on the form."
    ],
    "stack": [
      "Astro",
      "JavaScript",
      "CSS"
    ],
    "live": "https://perezpladur.com/"
  },
  {
    "name": "munozengineer.com",
    "tagline": "Personal portfolio site for a mechanical engineer based in Spain.",
    "description": "One-page website for a mechanical engineer based in Spain. It explains what he does (structural design, thermal systems, precision manufacturing), lists his tools and skills, and lets visitors contact him by email, LinkedIn or a message form. The projects section is still marked as coming soon.",
    "highlights": [
      "Gives recruiters and clients one link with his profile, software skills and contact options, open to jobs and consulting.",
      "The contact form accepts up to 5 attachments (10 MB total) and sends them to a separate API at api.munozengineer.com.",
      "Built with Astro: the profile photo is converted to WebP on the fly by Astro’s image endpoint, and link-preview (Open Graph/Twitter) tags are set up."
    ],
    "stack": [
      "Astro",
      "CSS",
      "WebP"
    ],
    "live": "https://munozengineer.com/"
  },
  {
    "name": "fast-dockerized-mailserver",
    "tagline": "A step-by-step setup for running your own email server instead of renting one.",
    "description": "Most people let Gmail or Outlook handle their email. This repo is a ready-made Docker Compose setup plus a written guide for hosting your own mail on a server you control, using the existing docker-mailserver image. I didn't write a mail server, I wrote down how to deploy one without the usual headaches.",
    "highlights": [
      "Your mail lives on your own server and domain, not on a big provider's platform.",
      "The guide walks through the DNS records mail needs (MX, A, SPF, DKIM, DMARC) so other servers trust your messages.",
      "One docker-compose.yml opens SMTP (25, 587) and IMAP (143, 993) with your own TLS certificates, spam filtering, ClamAV antivirus and Fail2ban enabled."
    ],
    "stack": [
      "Docker Compose",
      "docker-mailserver",
      "Postfix",
      "Dovecot",
      "OpenDKIM",
      "SpamAssassin"
    ],
    "repo": "https://github.com/propstgonz/fast-dockerized-mailserver"
  },
  {
    "name": "dockerized-wake-on-lan-service",
    "tagline": "A tiny watchdog that switches a computer back on if it ever goes offline.",
    "description": "Wake-on-LAN is a feature that lets a computer be switched on remotely by sending it a special 'magic packet' over the network. This service keeps checking whether a chosen machine, like a home server, is reachable, and sends that packet whenever it isn't. So the machine comes back by itself after a power cut or someone shutting it down, as long as it supports Wake-on-LAN.",
    "highlights": [
      "Set it up once and a home server or NAS can power itself back on without you touching it.",
      "Checks with a plain ping every 30 seconds by default, and the interval is a single setting.",
      "Runs in Docker (Python 3.11 plus etherwake) on the host network; target IP, MAC and interface are env vars."
    ],
    "stack": [
      "Python",
      "Docker",
      "Docker Compose",
      "etherwake"
    ],
    "repo": "https://github.com/propstgonz/dockerized-wake-on-lan-service"
  }
];
