import { initGame, resizeGame } from './game.js';
import { initNametagsToggle } from './player-nametags.js';
import { fetchHealth, isRenderHost } from './game-api.js';

const loginScreen = document.getElementById('login-screen');
const appShell = document.getElementById('app-shell');
const loginName = document.getElementById('login-name');
const loginSubmit = document.getElementById('login-submit');
const headerPlayer = document.getElementById('header-player-name');
const gamePanel = document.getElementById('panel-game');
const loginStatus = document.getElementById('login-server-status');
const loginError = document.getElementById('login-error');

let starting = false;

function showLoginError(msg) {
  if (!loginError) return;
  loginError.textContent = msg;
  loginError.hidden = !msg;
}

function showBootLoading(on, text = 'Cargando…', pct = null) {
  let wrap = document.getElementById('game-boot-load');
  if (!wrap && gamePanel) {
    wrap = document.createElement('div');
    wrap.id = 'game-boot-load';
    wrap.className = 'game-boot-load';
    wrap.innerHTML = `
      <div class="game-boot-inner">
        <p class="game-boot-text">Cargando…</p>
        <div class="game-boot-bar"><div class="game-boot-fill"></div></div>
      </div>`;
    gamePanel.appendChild(wrap);
  }
  if (!wrap) return;

  const textEl = wrap.querySelector('.game-boot-text');
  const fill = wrap.querySelector('.game-boot-fill');
  if (textEl) textEl.textContent = text;
  if (fill && pct != null) fill.style.width = `${Math.min(100, Math.max(0, pct))}%`;

  wrap.classList.toggle('hidden', !on);
}

function serverLabel() {
  if (typeof location === 'undefined') return 'servidor';
  const host = location.host;
  return host || 'localhost:3000';
}

async function pingServer() {
  if (!loginStatus) return false;
  const onRender = isRenderHost();
  loginStatus.textContent = onRender
    ? 'Despertando servidor en Render (pode tardar 1 min)…'
    : 'Comprobando servidor…';
  loginStatus.className = 'login-server-status';
  showLoginError('');

  try {
    await fetchHealth();
    loginStatus.textContent = `Servidor listo · ${serverLabel()}`;
    loginStatus.className = 'login-server-status ok';
    return true;
  } catch (err) {
    loginStatus.textContent = onRender
      ? 'Servidor aínda arrancando ou durmido en Render'
      : 'Servidor apagado';
    loginStatus.className = 'login-server-status err';
    showLoginError(
      err.message ||
        (onRender
          ? 'Recarga a páxina dentro dun minuto. O plan gratis de Render é lento ao inicio.'
          : 'Na carpeta do xogo executa: npm run play')
    );
    return false;
  }
}

async function enterGame() {
  if (starting) return;
  if (!loginSubmit || !loginScreen || !appShell) return;

  showLoginError('');

  const name = (loginName?.value.trim() || 'Peregrino').slice(0, 20);
  localStorage.setItem('santiago-go-name', name);

  starting = true;
  loginSubmit.disabled = true;
  loginSubmit.textContent = 'Cargando…';

  loginScreen.classList.add('hidden');
  appShell.classList.remove('hidden');
  if (headerPlayer) headerPlayer.textContent = name;
  initNametagsToggle();

  showBootLoading(true, 'Conectando co servidor…', 5);

  try {
    const bootPromise = initGame({ name }, (msg, pct) => showBootLoading(true, msg, pct));
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('Tempo de espera esgotado. Recarga a páxina e tenta de novo.')),
        120000
      );
    });
    await Promise.race([bootPromise, timeoutPromise]);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resizeGame());
    });
  } catch (err) {
    console.error(err);
    showLoginError(err.message || 'Erro ao iniciar o xogo.');
    loginScreen.classList.remove('hidden');
    appShell.classList.add('hidden');
  } finally {
    showBootLoading(false);
    starting = false;
    if (loginSubmit) {
      loginSubmit.disabled = false;
      loginSubmit.textContent = 'Entrar ao xogo';
    }
  }
}

if (loginSubmit) {
  loginSubmit.addEventListener('click', enterGame);
}
if (loginName) {
  loginName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') enterGame();
  });
  loginName.value = localStorage.getItem('santiago-go-name') || '';
  loginName.focus();
  loginName.select();
}

pingServer();
