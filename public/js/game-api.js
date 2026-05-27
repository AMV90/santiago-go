/** Cliente lixeiro: todo o pesado vai ao servidor (npm run play). */

const API_BASE =
  typeof location !== 'undefined' && location.port === '5173'
    ? 'http://localhost:3000'
    : typeof location !== 'undefined'
      ? ''
      : 'http://localhost:3000';

const DEFAULT_TIMEOUT_MS = 45000;
const BOOTSTRAP_TIMEOUT_MS = 120000;

function isRenderHost() {
  return typeof location !== 'undefined' && /onrender\.com$/i.test(location.hostname);
}

function mapFetchError(err) {
  if (err.name === 'AbortError') {
    return new Error(
      isRenderHost()
        ? 'O servidor tarda en responder (Render gratis «desperta» 30–90 s). Téntao de novo.'
        : 'Tempo de espera esgotado ao conectar co servidor.'
    );
  }
  if (err instanceof TypeError) {
    return new Error(
      isRenderHost()
        ? 'Non hai resposta do servidor. Espera 1 minuto e recarga (primeiro arranque en Render).'
        : 'Non hai servidor. Executa npm run play e abre http://localhost:3000'
    );
  }
  return err;
}

async function apiGet(path, { timeoutMs = DEFAULT_TIMEOUT_MS, retry503 = false } = {}) {
  const url = `${API_BASE}${path}`;
  const maxAttempts = retry503 ? 40 : 1;
  let lastErr = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);

    try {
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);

      if (res.status === 503 && retry503 && attempt < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 404) {
          throw new Error(
            'API non atopada. Comproba que o servizo en Render sexa Node (npm start), non sitio estático.'
          );
        }
        throw new Error(err.error || `Erro ${res.status}`);
      }

      return res.json();
    } catch (err) {
      clearTimeout(timer);
      lastErr = mapFetchError(err);
      if (retry503 && attempt < maxAttempts - 1 && lastErr.message?.includes('503')) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      if (!retry503 || attempt >= maxAttempts - 1) throw lastErr;
    }
  }

  throw lastErr || new Error('Non se puido conectar co servidor.');
}

async function apiPost(path, body, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erro ${res.status}`);
    }
    return res.json();
  } catch (err) {
    clearTimeout(timer);
    throw mapFetchError(err);
  }
}

export function fetchHealth() {
  return apiGet('/api/health', { timeoutMs: 25000, retry503: true });
}

export function fetchBootstrap() {
  return apiGet('/api/bootstrap', {
    timeoutMs: BOOTSTRAP_TIMEOUT_MS,
    retry503: true,
  });
}

export function fetchStreetChunk(x, y, r = 2400) {
  return apiGet(`/api/streets?x=${Math.round(x)}&y=${Math.round(y)}&r=${Math.round(r)}`);
}

export function fetchMinimapStreets(x, y, r = 5000) {
  return apiGet(`/api/minimap-streets?x=${Math.round(x)}&y=${Math.round(y)}&r=${Math.round(r)}`);
}

export function fetchPath(fromX, fromY, toX, toY) {
  return apiPost(
    '/api/path',
    { fromX, fromY, toX, toY },
    { timeoutMs: 90000 }
  );
}

export function fetchRespawnNpc({ level, faction, awayFromX, awayFromY, minDist }) {
  return apiPost('/api/respawn-npc', { level, faction, awayFromX, awayFromY, minDist });
}

export function tileProxyUrl(z, tx, ty) {
  return `${API_BASE}/api/tiles/${z}/${tx}/${ty}`;
}

export { isRenderHost };
