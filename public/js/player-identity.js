/** Nome do xogador (definido no login). */
export function getTabPlayerName() {
  return (localStorage.getItem('santiago-go-name') || 'Peregrino').trim().slice(0, 20) || 'Peregrino';
}

/** Desprazamento ao spawn para non amontar xogadores no mesmo punto. */
export function getTabSpawnOffset() {
  const tabId = sessionStorage.getItem('santiago-go-tab-id');
  if (!tabId) {
    const id =
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).slice(2, 10)
      ).toUpperCase();
    sessionStorage.setItem('santiago-go-tab-id', id);
  }
  const key = sessionStorage.getItem('santiago-go-tab-id') || '0';
  const n = parseInt(key.slice(0, 4), 36) || 0;
  const ring = n % 8;
  const angle = (ring / 8) * Math.PI * 2;
  const dist = 28 + (ring % 3) * 12;
  return { x: Math.round(Math.cos(angle) * dist), y: Math.round(Math.sin(angle) * dist) };
}
