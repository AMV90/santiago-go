import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initMapService,
  getBootstrap,
  getStreetsChunk,
  getMinimapStreets,
  findPath,
} from './map-service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const PORT = process.env.PORT || 3000;

initMapService();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

app.use(express.json({ limit: '32kb' }));

/** API do xogo — o cliente non descarga map-data.json */
app.get('/api/bootstrap', (_req, res) => {
  try {
    res.json(getBootstrap());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/streets', (req, res) => {
  const x = Number(req.query.x);
  const y = Number(req.query.y);
  const r = Number(req.query.r) || 2400;
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return res.status(400).json({ error: 'Parámetros x, y obrigatorios' });
  }
  try {
    res.json(getStreetsChunk(x, y, Math.min(r, 5500)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/minimap-streets', (req, res) => {
  const x = Number(req.query.x);
  const y = Number(req.query.y);
  const r = Number(req.query.r) || 5000;
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return res.status(400).json({ error: 'Parámetros x, y obrigatorios' });
  }
  try {
    res.json({ streets: getMinimapStreets(x, y, Math.min(r, 8000)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/path', (req, res) => {
  const { fromX, fromY, toX, toY } = req.body || {};
  if ([fromX, fromY, toX, toY].some((v) => !Number.isFinite(Number(v)))) {
    return res.status(400).json({ error: 'Coordenadas inválidas' });
  }
  try {
    const result = findPath(Number(fromX), Number(fromY), Number(toX), Number(toY));
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Proxy de tiles OSM (evita CORS e centraliza carga) */
app.get('/api/tiles/:z/:x/:y', async (req, res) => {
  const { z, x, y } = req.params;
  const url = `https://basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;
  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return res.status(upstream.status).end();
    }
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buf);
  } catch {
    res.status(502).end();
  }
});

app.post('/api/respawn-npc', (req, res) => {
  const level = Number(req.body?.level);
  const faction = req.body?.faction === 'fontinas' ? 'fontinas' : 'urban';
  const awayFromX = Number(req.body?.awayFromX) || 0;
  const awayFromY = Number(req.body?.awayFromY) || 0;
  const minDist = Number(req.body?.minDist) || 900;

  if (!Number.isFinite(level) || level < 1) {
    return res.status(400).json({ error: 'Nivel inválido' });
  }

  try {
    const npc = respawnOverworldNpc({ level, faction, awayFromX, awayFromY, minDist });
    if (!npc) return res.status(503).json({ error: 'Non se atopou punto de reaparición' });
    res.json({ ok: true, npc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(root, 'public')));

/** @type {Map<string, { id: string, name: string, x: number, y: number, level: number, zone: string }>} */
const players = new Map();

function publicState(forZone = null) {
  const list = Array.from(players.values());
  if (!forZone) return list;
  return list.filter((p) => (p.zone || 'world') === forZone);
}

function playerZone(socketId) {
  return players.get(socketId)?.zone || 'world';
}

io.on('connection', (socket) => {
  socket.on('join', (data) => {
    const name = String(data?.name || 'Xogador').slice(0, 20);
    const level = Number(data?.level) || 1;
    const x = Number(data?.x) || 0;
    const y = Number(data?.y) || 0;
    const zone = String(data?.zone || 'world').slice(0, 32);

    players.set(socket.id, { id: socket.id, name, x, y, level, zone });
    socket.emit('world-state', publicState(zone));
    const me = players.get(socket.id);
    broadcastToZone(zone, 'player-joined', me, socket.id);
  });

  socket.on('enter-zone', (data) => {
    const p = players.get(socket.id);
    if (!p || !data) return;
    const prevZone = p.zone || 'world';
    const zone = String(data.zone || 'world').slice(0, 32);
    p.zone = zone;
    p.x = Number(data.x) ?? p.x;
    p.y = Number(data.y) ?? p.y;
    if (data.level != null) p.level = Number(data.level) || p.level;

    socket.emit('world-state', publicState(zone));
    broadcastToZone(prevZone, 'player-left', { id: socket.id }, socket.id);
    broadcastToZone(zone, 'player-joined', p, socket.id);
  });

  socket.on('move', (data) => {
    const p = players.get(socket.id);
    if (!p || !data) return;
    p.x = Number(data.x) || p.x;
    p.y = Number(data.y) || p.y;
    if (data.level != null) p.level = Number(data.level) || p.level;
    broadcastToZone(p.zone || 'world', 'player-moved', {
      id: socket.id,
      name: p.name,
      x: p.x,
      y: p.y,
      level: p.level,
      zone: p.zone,
    }, socket.id);
  });

  socket.on('chat', (data) => {
    const p = players.get(socket.id);
    if (!p || !data?.text) return;
    const text = String(data.text).trim().slice(0, 80);
    if (!text) return;
    broadcastToZone(p.zone || 'world', 'chat', {
      id: socket.id,
      name: p.name,
      text,
      x: p.x,
      y: p.y,
    });
  });

  socket.on('disconnect', () => {
    const p = players.get(socket.id);
    if (p) {
      const zone = p.zone || 'world';
      players.delete(socket.id);
      broadcastToZone(zone, 'player-left', { id: socket.id });
    }
  });
});

function broadcastToZone(zone, event, payload, exceptId = null) {
  for (const [id, sock] of io.sockets.sockets) {
    if (exceptId && id === exceptId) continue;
    if (playerZone(id) === zone) sock.emit(event, payload);
  }
}

httpServer.listen(PORT, () => {
  console.log(`Santiago Go — http://localhost:${PORT}`);
  console.log('Mapa e rutas no servidor · cliente lixeiro');
});
