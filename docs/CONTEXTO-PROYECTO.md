# Santiago Go — mapa de contexto para sesiones de IA

Documento de continuidad. Léelo al abrir una conversación nueva sobre este repo.

**Repo:** https://github.com/AMV90/santiago-go (usuario **AMV90**)  
**Idioma de respuestas al usuario:** español  
**Regla de trabajo acordada:** tras cambios en código → **commit + push** a `main` (salvo que el usuario diga lo contrario).

---

## Qué es el proyecto

RPG 2D estilo Pokémon ambientado en **Santiago de Compostela**. Mapa real basado en **OpenStreetMap** (calles, locales). Multijugador con **Socket.io**. Cliente ligero en el navegador (Phaser 3); lógica pesada en **servidor Node**.

No confundir con **AMV90/SGO** (otro repo: ciudad 3D Three.js).

---

## Arranque local

```bash
cd "Santiago Go"
npm install
npm run play          # → http://localhost:3000  (USAR ESTE para jugar completo)
npm run dev           # → :5173 solo estático; multijugador necesita :3000
npm run build:map     # regenerar data/map-data.json desde OSM
npm run sprites       # PNGs 64×24 en public/assets/sprites/
```

**Requisitos:** Node 20.x, `data/map-data.json` (~3 MB, obligatorio en servidor).

---

## Despliegue (Render)

- **URL producción:** https://santiago-go.onrender.com  
- **Start Command:** `node server/index.js` o `npm run play` / `npm start` (equivalentes)  
- **Health check:** `/api/health` → `{ ok: true, status: "ready" }` cuando el mapa terminó de cargar  
- Plan **free:** cold start 30–90 s; el servicio duerme sin tráfico  
- Config en `render.yaml` (Node 20, `npm install`, health `/api/health`)

### Arranque del servidor en Render

1. `httpServer.listen(PORT)` **antes** de cargar el mapa  
2. `startMapServiceAsync()` carga en segundo plano: calles, grafo A*, NPCs, bots, pickups  
3. Hasta `mapReady`, `/api/bootstrap` devuelve **503**

### Problemas ya resueltos en producción

| Problema | Causa | Fix |
|----------|--------|-----|
| «Comprobando servidor…» infinito | Mapa bloqueaba antes de `listen` | Carga async + `/api/health` |
| `nodeByKey.values().map is not a function` | Iterator sin `.map` en Node | `Array.from()` en `street-graph.js` |
| Clic en mapa muy lento | A* con `open.sort()` cada iteración | MinHeap en `street-graph.js` + feedback UI |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│  Navegador (public/)                                         │
│  index.html → main.js (login) → game.js (Phaser)             │
│  - Movimiento WASD: movement-controller + streetWalker       │
│  - Clic mapa: POST /api/path → navegación por waypoints      │
│  - Calles visibles: chunks GET /api/streets                  │
│  - Tiles: GET /api/tiles/{z}/{x}/{y} (proxy Carto)           │
│  - Multijugador: socket.io (network.js, remote-players.js)   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP + WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│  server/index.js (Express + Socket.io)                       │
│  server/map-service.js — map-data, grafo, spawn, bootstrap   │
│  Importa lógica compartida desde public/js/*.js              │
└─────────────────────────────────────────────────────────────┘
```

**Principio:** el cliente **no** descarga `map-data.json` entero; usa `/api/bootstrap` (~1–2 MB con NPCs + bots compactos).

---

## Mapa del código (archivos clave)

| Ruta | Rol |
|------|-----|
| `public/index.html` | UI: login, pestañas Diseño / Xogar, HUD, combate |
| `public/js/main.js` | Login, ping `/api/health`, arranca `initGame` |
| `public/js/game.js` | Escena Phaser principal, mundo, update loop |
| `public/js/game-api.js` | Cliente HTTP: bootstrap, streets, path, tiles, respawn |
| `public/js/config.js` | Constantes: velocidades, conteos NPC/bots, multijugador |
| `public/js/sprites.js` | Spritesheets PNG + fallback procedural |
| `public/js/street-graph.js` | Grafo + A* (servidor y lógica de rutas) |
| `public/js/street-walk.js` | Caminar pegado a calles (cliente) |
| `public/js/street-chunks.js` | Carga incremental de calles alrededor del jugador |
| `public/js/path-navigation.js` | Clic → `fetchPath` → seguir ruta |
| `public/js/map-click.js` | Listener clic + marcador amarillo destino |
| `public/js/walk-bots.js` | Cidadáns verdes (120), rutas A*, hablar (Espacio) |
| `public/js/npcs.js` | Rivales de combate (122), respawn mismo nivel |
| `public/js/npcs.js` + `game.js` | Combate al ganar: `fetchRespawnNpc`, cuenta constante |
| `public/js/interior-zone.js` | Entrar/salir interiores, ocultar overworld |
| `public/js/interiors/` | layouts + places (catedral, pubs, hospitales, etc.) |
| `server/index.js` | API REST + Socket.io + static `public/` |
| `server/map-service.js` | Init mapa, bootstrap, chunks, pathfinding |
| `data/map-data.json` | Calles OSM procesadas (~22k vías) |
| `scripts/build-map-data.mjs` | OSM → map-data |
| `render.yaml` | Blueprint Render |

---

## Mecánicas de juego (resumen)

| Elemento | Comportamiento |
|----------|----------------|
| **Jugador** | Spawn Praza Obradoiro; solo calles; WASD con inercia |
| **Clic mapa / minimapa** | Ruta calculada en **servidor** (A*); feedback «Calculando ruta…» |
| **NPCs rojos/morados** | Combate (E o chocar); al vencer → respawn otro **mismo nivel** en otro punto |
| **Bots verdes** | 120 cidadáns; caminan rutas; Espacio para charlar; velocidad 55–85 px/s |
| **Multijugador** | Auto-conexión; sprites morados; zonas world/interior |
| **Interiores** | Catedral, pubs/clubs, Área Central, estación, 20 sitios emblemáticos, 3 hospitales |
| **Perros / objetos** | Huesos, captura; pickups en calle |
| **Progreso** | localStorage: `santiago-go-player`, `santiago-go-defeated`, etc. |

---

## Interiores implementados

| ID | Lugar |
|----|--------|
| `catedral` | Catedral (sacerdotes nv.30) |
| `bar-momo` | Pub Momo |
| `riquela` | Riquela Club |
| `modus-vivendi` | Modus Vivendi (2 plantas) |
| `area-central` | Área Central outlet (~500 m) |
| `estacion-tren` | Estación Daniel Castelao (viaxeiros) |
| `peleteiro-patio` + `p1`–`p4` | Antigo Peleteiro (República Arxentina): patio, 4 pisos, combate |
| `mercado-abastos`, `cgac`, `cidade-cultura`, … | 20 sitios en `santiago-sites-data.js` |
| `hospital-chus` / `conxo` / `rosaleda` | Hospitales + recepcionista cura |

Patrón: `interiors/layouts/*.layout.js` + `interiors/places/*.place.js` → registrar en `places/index.js`. Lote de 20: `santiago-sites-data.js` + planta única por sitio en `interiors/layouts/sites/`.

---

## API REST (servidor)

| Método | Ruta | Uso |
|--------|------|-----|
| GET | `/api/health` | Ping ligero (login + Render) |
| GET | `/api/bootstrap` | Mundo inicial (spawn, npcs, bots, calles iniciales) |
| GET | `/api/streets?x&y&r` | Chunk de calles |
| GET | `/api/minimap-streets?x&y&r` | Minimapa |
| POST | `/api/path` | A* entre dos puntos |
| POST | `/api/respawn-npc` | Nuevo rival mismo nivel |
| GET | `/api/tiles/:z/:x/:y` | Proxy tiles Carto |

Socket.io: `join`, `move`, `chat`, `enter-zone`, etc.

---

## Sprites

- **LPC (incluídos no repo):** `public/assets/lpc/characters/*.png` + `lpc-manifest-data.js`  
  - Xerador: [Universal LPC Spritesheet Character Generator](https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/)  
  - Regenerar: `npm run lpc:sync` + `npm run sprites:lpc` · Definicións: `scripts/lpc/characters.json`  
  - Docs: `public/assets/lpc/README.md` · Créditos: `public/assets/lpc/CREDITS.md`  
- **Legacy:** `npm run sprites` → fallback 16×24 en `public/assets/sprites/`

### Peleteiro (tileset pixel)

- `npm run sprites:peleteiro` → `public/assets/tilesets/peleteiro.png` (35 tiles 16×16: suelo, escaleras, alfombras, mesas, sillas, expositor, estantería, pizarra…)  
- Interiores `peleteiro-*`: `tileset: 'peleteiro'` + `peleteiro-tile-render.js` (RenderTexture, filtro NEAREST)  
- Layout ASCII sin cambios (colisión, escaleras, NPCs); solo cambia el dibujo

---

## Quién consume recursos (pregunta frecuente)

| Acción | Back | Front |
|--------|------|-------|
| Clic para ir a un sitio | **A*** (pesado en Render free) | Dibuja marcador + mueve tras respuesta |
| WASD | — | Movimiento + streetWalker local |
| Cargar calles al moverte | Chunk API | Dibuja + reconstruye walker |
| Tiles mapa | Proxy | Phaser images |
| 88–120 bots | Posiciones iniciales en bootstrap; rutas vía `/api/path` | Animación sprites |
| Combate | — | UI overlay |

---

## Variables de entorno

**Ninguna obligatoria.** Render asigna `PORT` automáticamente. Opcional: `NODE_VERSION=20`.

---

## Git / convenciones

- Rama principal: `main`  
- Commits en español o bilingüe, mensajes claros del **porqué**  
- No commitear `node_modules/`  
- Tras implementar: **push a origin main**  
- Usuario: **AMV90**

---

## Pendientes / ideas (no implementado o a verificar)

- Confirmar en Render que el deploy usa commit reciente (no `e44d683` antiguo)  
- Plan free: latencia multijugador y cold starts  
- Posible optimización futura: pathfinding por regiones o límite de distancia en clic  
- README de usuario puede estar parcialmente desactualizado vs. respawn NPCs y bots

---

## Cómo usar este doc en Cursor

En una sesión nueva, di por ejemplo:

> Lee `docs/CONTEXTO-PROYECTO.md` y continúa con [tu tarea].

Para **personajes, LPC, esqueletos, FX o interiores con Sprite Forge**:

> Lee `docs/GUIA-GENERADORES-SPRITES.md`.

O añade una regla en `.cursor/rules` que apunte a este archivo.

---

*Última actualización de contexto: sesión con deploy Render, fix A*, bots verdes, respawn NPCs, push automático a GitHub.*
