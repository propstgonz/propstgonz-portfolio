// Vanilla typewriter — replaces typed.js dependency.
// Import and call init() from any page script.

export function initTypewriter(
  elementId: string,
  messages:  string[],
  typingMs  = 50,
  erasingMs = 22,
  pauseMs   = 2200,
) {
  const el = document.getElementById(elementId);
  if (!el || messages.length === 0) return;

  let mi = 0;
  let ci = 0;

  function type() {
    const cur = messages[mi];
    if (ci < cur.length) {
      el.textContent = cur.slice(0, ++ci);
      setTimeout(type, typingMs + Math.random() * 20);
    } else {
      setTimeout(erase, pauseMs);
    }
  }

  function erase() {
    if (ci > 0) {
      el.textContent = (el.textContent ?? '').slice(0, --ci);
      setTimeout(erase, erasingMs);
    } else {
      mi = (mi + 1) % messages.length;
      setTimeout(type, 400);
    }
  }

  setTimeout(type, 800);
}
