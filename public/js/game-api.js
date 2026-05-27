/** Cliente lixeiro: todo o pesado vai ao servidor (npm run play). */

const API_BASE =
  typeof location !== 'undefined' && location.port === '5173'
    ? 'http://localhost:3000'
    : typeof location !== 'undefined'
      ? ''
      : 'http://localhost:3000';

async function apiGet(path) {
  const url = `${API_BASE}${path}`;
  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error(
      'Non hai servidor. Executa npm run play e abre http://localhost:3000'
    );
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 404) {
      throw new Error(
        'API non atopada. Reinicia o servidor: npm run play (http://localhost:3000)'
      );
    }
    throw new Error(err.error || `Erro ${res.status}`);
  }
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erro ${res.status}`);
  }
  return res.json();
}

export function fetchBootstrap() {
  return apiGet('/api/bootstrap');
}

export function fetchStreetChunk(x, y, r = 2400) {
  return apiGet(`/api/streets?x=${Math.round(x)}&y=${Math.round(y)}&r=${Math.round(r)}`);
}

export function fetchMinimapStreets(x, y, r = 5000) {
  return apiGet(`/api/minimap-streets?x=${Math.round(x)}&y=${Math.round(y)}&r=${Math.round(r)}`);
}

export function fetchPath(fromX, fromY, toX, toY) {
  return apiPost('/api/path', { fromX, fromY, toX, toY });
}

export function fetchRespawnNpc({ level, faction, awayFromX, awayFromY, minDist }) {
  return apiPost('/api/respawn-npc', { level, faction, awayFromX, awayFromY, minDist });
}

export function tileProxyUrl(z, tx, ty) {
  return `${API_BASE}/api/tiles/${z}/${tx}/${ty}`;
}
