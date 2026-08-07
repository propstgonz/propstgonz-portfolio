// Vanilla typewriter effect. No external dependencies.

export function initTypewriter(
  elementId: string,
  messages: string[],
  typingMs = 50,
  erasingMs = 22,
  pauseMs = 2200,
) {
  const el = document.getElementById(elementId);
  if (!el || messages.length === 0) return;

  let mi = 0;
  let ci = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function type() {
    const cur = messages[mi];
    if (ci < cur.length) {
      ci++;
      if (el) el.textContent = cur.slice(0, ci);
      timer = setTimeout(type, typingMs + Math.random() * 20);
    } else {
      timer = setTimeout(erase, pauseMs);
    }
  }

  function erase() {
    if (ci > 0) {
      ci--;
      if (el) el.textContent = (el.textContent ?? '').slice(0, ci);
      timer = setTimeout(erase, erasingMs);
    } else {
      mi = (mi + 1) % messages.length;
      timer = setTimeout(type, 400);
    }
  }

  if (timer) clearTimeout(timer);
  timer = setTimeout(type, 800);
}
