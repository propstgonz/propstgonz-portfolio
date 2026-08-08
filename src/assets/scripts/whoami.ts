// Calls ipify directly from the browser — this has to run client-side,
// since a server-side call would report this server's own public IP
// instead of the visitor's.
export async function initIpDisplay(elementId: string) {
  const el = document.getElementById(elementId);
  if (!el) return;

  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = (await res.json()) as { ip: string };
    el.textContent = data.ip;
  } catch {
    el.textContent = 'unknown';
  }
}
