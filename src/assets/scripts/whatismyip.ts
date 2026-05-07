interface IpifyResponse {
  ip: string;
}

async function fetchAndUpdateIP(): Promise<void> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = (await response.json()) as IpifyResponse;
    
    const ipSpan = document.getElementById('client-ip');
    if (ipSpan) {
      ipSpan.textContent = data.ip;
    }
  } catch (error) {
    console.error('Failed to fetch IP:', error);
    const ipSpan = document.getElementById('client-ip');
    if (ipSpan) {
      ipSpan.textContent = 'unavailable';
    }
  }
}

// Ejecuta la función para obtener la ip
fetchAndUpdateIP();

// Solo recarga una vez al entrar por primera vez para que la puta ip se vea
if (!sessionStorage.getItem('reloadedOnce')) {
  setTimeout(() => {
    sessionStorage.setItem('reloadedOnce', 'true');
    location.reload();
  }, 1000);
}
