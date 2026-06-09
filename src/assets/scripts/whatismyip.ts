// Fetches the visitor's public IP and updates an element by ID.
export async function initIpDisplay(elementId: string) {
  const el = document.getElementById(elementId);
  if (!el) return;

  try {
    const res  = await fetch('https://api.ipify.org?format=json');
    const data = await res.json() as { ip: string };
    el.textContent = data.ip;
  } catch {
    el.textContent = 'unknown';
  }
}
