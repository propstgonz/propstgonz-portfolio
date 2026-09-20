const CONSENT_KEY = 'propstgonz-consent';

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
