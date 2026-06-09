export interface FaqEntry {
  q: string;
  a: string;
}

export const faq: FaqEntry[] = [
  {
    q: "Who are you?",
    a: "I'm Propst, an IT student from Galicia, Spain. I love tinkering with things just for the fun of it.",
  },
  {
    q: "What do you do?",
    a: "Mostly IT-related stuff — programming, self-hosting, breaking things and fixing them. Sometimes in that order.",
  },
  {
    q: "What's your stack?",
    a: "Depends on the project. For web: Astro, TypeScript, Tailwind, Express, MongoDB. For infrastructure: Docker, Traefik, Nginx, Jenkins.",
  },
  {
    q: "Can I contact you?",
    a: "Sure, use the contact form on the home page or email propstgonz@baronette.es. Just don't send ASCII dicks.",
  },
  {
    q: "Is this site open source?",
    a: "The code lives at github.com/propstgonz/propstgonz-portfolio. Do whatever you want with it.",
  },
  {
    q: "What OS do you use?",
    a: "Linux. I switch distros every few months out of boredom. Currently something that works.",
  },
];
