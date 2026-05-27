# Santiago Go — Especificaciones (resumen para futuras conversaciones)

RPG 2D estilo Pokémon en **Santiago de Compostela** (área metropolitana). Datos de calles reales desde **OpenStreetMap**.

---

## Cómo arrancar

```bash
npm install
npm run play          # Servidor + juego → http://localhost:3000
npm run build:map     # Regenerar mapa desde OSM (tras cambiar data/overpass-query.txt)
npm run sprites       # Sprites overworld PNG (16×24)
npm run sprites:battle # Sprites de combate SVG (estilo Pokémon)
```

**Importante:** el juego completo usa `npm run play` (puerto 3000). `npm run dev` (:5173) solo sirve archivos estáticos; la API y multijugador necesitan el servidor en 3000.

---

## Arquitectura (cliente ligero / servidor pesado)

```
┌─────────────────────────────────────────────────────────┐
│  NAVEGADOR (cliente)                                     │
│  · Phaser 3 — render, sprites, combates, cámara         │
│  · NO descarga map-data.json completo (~3 MB)           │
│  · Pide trozos al servidor según lo que ve la cámara    │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP + Socket.io
┌───────────────────────▼─────────────────────────────────┐
│  SERVIDOR (Node + Express + Socket.io) — server/         │
│  · Carga mapa una vez: data/map-data.json                 │
│  · Grafo A*, street-walker, spawns (NPCs, pickups, etc.) │
│  · API REST + proxy de tiles OSM                          │
│  · Multijugador: posiciones, chat                         │
└─────────────────────────────────────────────────────────┘
```

### API principal

| Ruta | Uso |
|------|-----|
| `GET /api/bootstrap` | Entrada al juego: spawn, NPCs, pickups, perros, bots, calles iniciales |
| `GET /api/streets?x=&y=&r=` | Calles en un radio (sin cortar arbitrariamente) |
| `GET /api/minimap-streets?x=&y=&r=` | Calles para el minimapa |
| `POST /api/path` | Ruta A* entre dos puntos (clic mapa / minimapa) |
| `GET /api/tiles/:z/:x/:y` | Proxy de imágenes OSM (fondo del mapa) |

### Qué son los **tiles**

Cuadrados de 256×256 px con mapa real (tipo Google Maps). El cliente solo carga los que cubren **la vista de la cámara** (no todo Santiago de una vez).

### Capas visuales (orden)

1. Suelo claro (`#d8e8d4`)
2. **Tiles** OSM (opacidad ~0,92)
3. **Calles** vectoriales (amarillo = con nombre, gris = sin nombre)
4. Sprites: jugador, NPCs, bots, otros jugadores, pickups, perros
5. HUD, minimapa, etiquetas de nombre (HTML/SVG, opcionales)

---

## Flujo de la aplicación

1. **Pantalla de login** — nombre → «Entrar ao xogo»
2. Carga: `bootstrap` del servidor (barra de progreso)
3. Mundo Phaser a pantalla completa (`Scale.RESIZE`)
4. Multijugador **automático** (Socket.io); tecla **M** para desconectar
5. Nombres de otros jugadores: **ocultos por defecto**; botón «Mostrar nomes» / «Ocultar nomes»

---

## Juego (mecánicas)

| Aspecto | Detalle |
|---------|---------|
| **Mapa** | 12800×12800 px; bounds N 42.968, S 42.798, W -8.685, E -8.448 |
| **Spawn** | Catedral / Praza do Obradoiro |
| **Movimiento** | WASD con inercia; **solo por calles** (street-walker en cliente con calles cargadas) |
| **Navegación** | Clic en mapa o **minimapa** → ruta calculada en **servidor** (A*) |
| **Minimapa** | Circular, **~10 km** de diámetro; clic = misma navegación que el mapa |
| **Combate** | E o choque con NPC; UI estilo Pokémon; rivales derrotados no reaparecen |
| **Muerte** | Vuelves a nivel 1 en la catedral |
| **Perros** | 3 huesos para capturar compañero |
| **Pickups** | Objetos en mapa (zona periférica); inventario y combate |
| **Multijugador** | Sprites morados + etiqueta; nombre único por pestaña (`Peregrino #XXXX`) |

### Controles (HUD inferior)

`WASD` · Clic mapa · Enter chat · `M` desconectar multijugador · `E` combate

---

## Estructura de carpetas (clave)

```
data/
  map-data.json       # Mapa procesado (solo servidor; no lo usa el cliente)
  osm-raw.json        # Descarga Overpass
  overpass-query.txt

public/
  js/
    game.js           # Phaser, mundo, bucle principal
    game-api.js       # Llamadas al servidor
    street-chunks.js  # Calles por zona + redibujado
    tile-manager.js   # Tiles según vista de cámara
    path-navigation.js
    network.js        # Socket.io
    minimap.js
    player-nametags.js
  css/
  assets/sprites/       # Overworld (mapa)
  assets/battle/        # Combate: player.svg, enemy-0..5.svg, enemy-bandit.svg
  battle-sprites.js     # Elige sprite según npc / facción fontinas

server/
  index.js            # Express + Socket.io + rutas API
  map-service.js      # Mapa en memoria, pathfinding, chunks

scripts/
  build-map-data.mjs  # OSM → data/map-data.json
```

---

## Datos y versiones

- `MAP_SAVE_VERSION` en `public/js/config.js` (ej. `santiago-metro-v9`): al cambiar, se resetea progreso local.
- **localStorage:** `santiago-go-name`, `santiago-go-player`, `santiago-go-defeated`, `santiago-go-collected`, `santiago-go-show-nametags`, `santiago-go-map-version`, `santiago-go-intro-seen`.

---

## Progreso hecho (estado actual)

### Hecho

- [x] Mapa metropolitano OSM (calles, ~22k segmentos)
- [x] Servidor con mapa, pathfinding y API
- [x] Cliente ligero (sin cargar 3 MB en el navegador)
- [x] Login único + juego a pantalla completa
- [x] Multijugador (varias pestañas / jugadores)
- [x] Minimapa circular 10 km con clic
- [x] Nombres SVG en pantalla (toggle mostrar/ocultar)
- [x] Tiles y calles según **vista de cámara** (no cuadrado pequeño fijo)
- [x] Calles completas por zona (sin recorte a 700 calles que rompía el paseo)
- [x] Combate, NPCs, pickups, perros, bots de paseo
- [x] Zoom con rueda; movimiento con inercia

### Retirado / no activo

- Pestaña **«Diseño do mapa»** (Leaflet) — eliminada de la UI; queda `map-design.geojson` por si se reutiliza

### Pendiente / ideas

- [ ] Entrar en locales del mapa (tiendas, vitaminas, XP)
- [ ] Minimapa: afinar rendimiento con zoom muy alejado
- [ ] Sprites propios definitivos
- [ ] Más contenido post-combate / economía
- [ ] Tests automatizados

---

## Problemas conocidos y soluciones rápidas

| Síntoma | Causa habitual | Solución |
|---------|----------------|----------|
| `Erro 404` al entrar | Servidor viejo o no arrancado | `npm run play` + Ctrl+F5 |
| Calles entrecortadas | Recorte de calles en chunks | Corregido: enviar todas las del radio |
| Cuadrado oscuro al alejar | Pocos tiles cargados | Corregido: tiles por vista de cámara |
| No ves otros jugadores | Sin `npm run play` o sin conexión | Dos ventanas en :3000, multijugador auto |

---

## Regenerar mapa OSM

```powershell
curl.exe -s -X POST "https://overpass.private.coffee/api/interpreter" --data-binary "@data/overpass-query.txt" -o data/osm-raw.json
npm run build:map
# Reiniciar: npm run play
```

---

## Notas para agentes / futuras conversaciones

1. Priorizar cambios en **servidor** si afectan a mapa, rutas o spawns; el **cliente** solo renderiza y envía input.
2. No volver a cargar `map-data.json` en el cliente sin motivo fuerte.
3. Cualquier límite de calles por `slice(0, N)` rompe caminar y dibuja huecos — usar radio completo.
4. Respuestas al usuario en **español** (preferencia del proyecto).
5. Commits solo si el usuario lo pide.

---

*Última actualización: mayo 2026 — coherente con arquitectura servidor/cliente y UI login única.*
