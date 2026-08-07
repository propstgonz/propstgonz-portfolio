import type { FaqEntry } from '../types/faq';

// Ported from the original site's FAQ (its actual personality, not a
// generic rewrite). Answers may contain trusted, first-party HTML
// (links, a live IP span) — this is authored content, not the
// untrusted external blog markdown, so it's rendered as raw HTML in
// <Faq />.
export const faq: FaqEntry[] = [
  {
    q: 'What is this site about?',
    a: 'This is my personal corner of the internet where I share updates, projects, and thoughts. ' +
      'The original idea was <a href="https://baronette.es" target="_blank" rel="noopener noreferrer">baronette.es</a>, ' +
      "but I decided to make it more personal and more focused on my own (I'm a bit of a narcissist).",
  },
  {
    q: 'Beyond all roles and memories, who am I at my core?',
    a: 'Hey, look buddy, I\'m a technician, that means I solve problems. Not problems like "What is beauty", ' +
      'because that would fall within the purview of your conundrum of philosophy. ' +
      'I solve practical problems, like "My printer isn\'t working" or "My [insert relative] helped me build my computer, and it doesn\'t turn on".',
  },
  {
    q: 'Can I contact you?',
    a: 'Absolutely! You can reach me via GitHub, Discord, or email. Check the socials and contact form on the homepage.',
  },
  {
    q: 'Can I add you on Steam or Xbox?',
    a: 'No, fuck off weirdo.',
  },
  {
    q: 'What are your upcoming projects?',
    a: "I don't know yet, but I'll probably keep leaning into back-end and self-hosting stuff, so expect more of that.",
  },
  {
    q: 'Do you accept contributions?',
    a: 'I appreciate interest, but most projects here are personal. However, feel free to suggest ideas or improvements!',
  },
  {
    q: 'Will you update this site again?',
    a: 'I already rebuilt it once because the old version became impossible to maintain — check the changelog on the homepage for what changed and when.',
  },
  {
    q: 'Why the terminal look?',
    a: "I love the terminal vibe. If you don't, well... tough luck!",
  },
  {
    q: 'Do you know what my IP is?',
    a: 'Yeah, your ip is <span id="client-ip">loading…</span>. If you don\'t believe me, check it in ' +
      '<a href="https://whatismyipaddress.com/" target="_blank" rel="noopener noreferrer">whatismyipaddress.com</a>, ' +
      'so maybe later I will swat you, be careful with that.',
  },
];
