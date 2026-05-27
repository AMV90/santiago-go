import { MULTIPLAYER_URL } from './config.js';

let socket = null;
let connected = false;
let activeHandlers = null;

function bindHandlers(sock, handlers) {
  if (!sock || !handlers) return;
  sock.off('world-state');
  sock.off('player-joined');
  sock.off('player-moved');
  sock.off('player-left');
  sock.off('chat');

  sock.on('world-state', (list) => handlers.onWorldState?.(list));
  sock.on('player-joined', (p) => handlers.onPlayerJoined?.(p));
  sock.on('player-moved', (p) => handlers.onPlayerMoved?.(p));
  sock.on('player-left', (p) => handlers.onPlayerLeft?.(p));
  sock.on('chat', (msg) => handlers.onChat?.(msg));
}

export function isOnline() {
  return connected && socket?.connected;
}

export function getSocketId() {
  return socket?.id ?? null;
}

export function connectMultiplayer(handlers) {
  return new Promise((resolve, reject) => {
    if (typeof io === 'undefined') {
      reject(new Error('Socket.io non cargado. Usa npm run play'));
      return;
    }

    activeHandlers = handlers;

    if (socket) {
      socket.disconnect();
      socket = null;
    }

    socket = io(MULTIPLAYER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    bindHandlers(socket, handlers);

    const timeout = setTimeout(() => {
      reject(new Error('Non hai servidor en ' + MULTIPLAYER_URL));
    }, 10000);

    socket.on('connect', () => {
      connected = true;
      clearTimeout(timeout);
      bindHandlers(socket, activeHandlers);
      resolve(socket);
    });

    socket.on('connect_error', (err) => {
      clearTimeout(timeout);
      connected = false;
      reject(err);
    });

    socket.on('disconnect', () => {
      connected = false;
    });
  });
}

export function joinMultiplayer({ name, level, x, y, zone = 'world' }) {
  if (!socket?.connected) return;
  socket.emit('join', { name, level, x, y, zone });
}

export function sendPosition(x, y, level) {
  if (!isOnline()) return;
  socket.emit('move', { x, y, level });
}

/** Cambia de instancia (world | catedral, etc.) */
export function enterMultiplayerZone(zone, x, y, level) {
  if (!isOnline()) return;
  socket.emit('enter-zone', { zone, x, y, level });
}

export function sendInteriorPosition(x, y, level) {
  if (!isOnline()) return;
  socket.emit('move', { x, y, level });
}

export function sendChat(text) {
  if (!isOnline()) return;
  socket.emit('chat', { text: String(text).slice(0, 80) });
}

export function disconnectMultiplayer() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  connected = false;
  activeHandlers = null;
}
