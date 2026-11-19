import { CONSENT_KEY, CONSENT_EVENT } from '../../lib/consent';

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

export function bindIpDisplay(elementId: string) {
  document.addEventListener('astro:page-load', () => initIpDisplay(elementId));
  window.addEventListener(CONSENT_EVENT, () => initIpDisplay(elementId));
}
