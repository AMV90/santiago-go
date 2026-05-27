# Santiago Go

Prototipo de RPG 2D al estilo Pokémon ambientado en la **zona vieja de Santiago de Compostela**. El mapa se basa en datos reales de [OpenStreetMap](https://www.openstreetmap.org): calles, edificios y locales del casco histórico.

## Qué incluye

1. **Diseño do mapa** — Mapa satélite/callejero real con capas trazadas encima:
   - Calles (líneas amarillas = con nombre; gris = sin nombre)
   - Edificios (polígonos azulados)
   - Locales: restaurantes, tiendas, museos, albergues, etc. (puntos de colores)

2. **Xogar** — RPG conflictivo estilo Pokémon:
   - **Multixogador**: ves a outros xogadores na mesma cidade (posición e nome).
   - Naces na **Praza do Obradoiro** (nivel 1, movemento **Puñetazo**).
   - **Só podes andar polas ruas** (WASD ou **clic no minimapa** → ruta máis rápida por A*).
   - **Minimapa** na esquina superior dereita coa túa posición e a zona visible.
   - Sprites PNG de exemplo incluídos (`npm run sprites` para rexenerar).
   - Ao cruzarte con rivais: preme **E** ou choca — combate con presentación tipo Pokémon.
   - Subes de nivel e aprendes movementos (Empujón, Patada, etc.).
   - Os rivais vencidos non reaparecen (gardado no navegador).
   - *Próximo:* locales para vitaminas, puntos de experiencia e máis rivais.

## Requisitos

- [Node.js](https://nodejs.org/) 18+

## Arrancar

```bash
cd "C:\Users\Veto\Desktop\Santiago Go"
npm install
npm run play
```

Abre **http://localhost:3000** → pestana **Xogar** → elixe nome → **Xogar en liña**.

Só mapa estático (sen socket):

```bash
npm run dev
```

→ **http://localhost:5173** (multixogador conecta ao servidor en `:3000` se está en marcha).

## Actualizar datos del mapa

Si cambias la consulta en `data/overpass-query.txt`:

```bash
# Descargar OSM (PowerShell)
curl.exe -s -X POST "https://overpass.kumi.systems/api/interpreter" --data-binary "@data/overpass-query.txt" -o data/osm-raw.json

# Generar capas de juego
npm run build:map
```

## Área do mapa (metropolitana)

| Borde | Coordenada |
|-------|------------|
| Norte | 42.968 |
| Sur   | 42.798 |
| Oeste | -8.685 |
| Este  | -8.448 |

Tamaño: **12800×12800** px (Santiago + Ames, Teo, arredores).

Tras cambiar a área, rexenera OSM e mapa:

```bash
curl.exe -s -X POST "https://overpass.kumi.systems/api/interpreter" --data-binary "@data/overpass-query.txt" -o data/osm-raw.json
npm run build:map
```

## Combate e nivel

| Nivel | Movemento novo      |
|-------|---------------------|
| 1     | Puñetazo            |
| 3     | Empujón             |
| 5     | Grito de guerra     |
| 7     | Patada              |
| 10    | Cabezazo            |
| 12    | Insulto veloz       |
| 15    | Golpe baixo         |

Borrar progreso no navegador: `localStorage` claves `santiago-go-player`, `santiago-go-defeated`, `santiago-go-intro-seen`.

## Próximos pasos sugeridos

- Entrar en **locales** (comercios do mapa) e mercar vitaminas / XP
- Sprites pixel art propios
- Exportar a [Tiled](https://www.mapeditor.org/) desde `public/map-data.json`

## Licencia de datos

© Contribuidores de OpenStreetMap — [ODbL](https://www.openstreetmap.org/copyright)
