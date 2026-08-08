const CONSENT_KEY = 'propstgonz-consent';

// Calls ipify directly from the browser — this has to run client-side,
// since a server-side call would report this server's own public IP
// instead of the visitor's. Gated behind the same consent as
// /api/track (ConsentBanner.astro): handing the visitor's IP to a third
// party (ipify.org) is itself a form of IP collection, so this waits for
// an explicit accept exactly like the tracking call does, instead of
// firing on every page load regardless of what the visitor chose.
export async function initIpDisplay(elementId: string) {
  const el = document.getElementById(elementId);
  if (!el) return;

  if (localStorage.getItem(CONSENT_KEY) !== 'accepted') {
    el.textContent = 'requires consent';
    return;
  }

  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = (await res.json()) as { ip: string };
    el.textContent = data.ip;
  } catch {
    el.textContent = 'unknown';
  }
}
