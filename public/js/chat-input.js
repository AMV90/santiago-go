import { isOnline, sendChat } from './network.js';
import { showChatBubble } from './chat-bubbles.js';
import { isBattleOpen } from './battle-ui.js';
import { resetMovementState } from './movement-controller.js';

export function isChatOpen() {
  const overlay = document.getElementById('chat-input-overlay');
  return Boolean(overlay && !overlay.classList.contains('hidden'));
}

function setGameKeyboard(scene, enabled) {
  if (!scene?.input?.keyboard) return;
  scene.input.keyboard.enabled = enabled;
  scene.input.keyboard.resetKeys();
  resetMovementState(scene);
}

export function openChatInput(scene) {
  const overlay = document.getElementById('chat-input-overlay');
  const input = document.getElementById('chat-input');
  if (!overlay || !input) return;
  overlay.classList.remove('hidden');
  setGameKeyboard(scene, false);
  input.focus();
}

export function closeChatInput(scene) {
  const overlay = document.getElementById('chat-input-overlay');
  const input = document.getElementById('chat-input');
  if (!overlay || !input) return;
  overlay.classList.add('hidden');
  input.blur();
  setGameKeyboard(scene, true);
}

export function setupChatInput(scene) {
  let overlay = document.getElementById('chat-input-overlay');
  let input = document.getElementById('chat-input');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'chat-input-overlay';
    overlay.className = 'chat-input-overlay hidden';
    input = document.createElement('input');
    input.id = 'chat-input';
    input.type = 'text';
    input.maxLength = 80;
    input.placeholder = 'Escribe e Enter para enviar…';
    input.autocomplete = 'off';
    overlay.appendChild(input);
    document.getElementById('panel-game')?.appendChild(overlay);
  }

  const send = () => {
    const text = input.value.trim();
    closeChatInput(scene);
    input.value = '';
    if (!text || !isOnline()) return;
    sendChat(text);
    showChatBubble(scene, 'local', text, scene.player.x, scene.player.y);
  };

  input.onkeydown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      send();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      input.value = '';
      closeChatInput(scene);
    }
  };

  input.onkeyup = (e) => e.stopPropagation();

  scene.input.keyboard.on('keydown-ENTER', (ev) => {
    if (scene.inBattle || isBattleOpen()) return;
    if (isChatOpen()) return;
    ev.stopPropagation();
    openChatInput(scene);
  });

  scene._closeChat = () => closeChatInput(scene);
}
