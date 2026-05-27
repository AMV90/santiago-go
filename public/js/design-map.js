import { CATEGORY_COLORS } from './geo.js';

const CENTER = [42.88025, -8.54454];

let map;
let layers = {};

export async function initDesignMap() {
  const geo = await fetch('./map-design.geojson').then((r) => r.json());
  const meta = await fetch('./map-data.json').then((r) => r.json());

  map = L.map('design-map', {
    center: CENTER,
    zoom: 17,
    minZoom: 16,
    maxZoom: 19,
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19,
  }).addTo(map);

  layers.streets = L.geoJSON(geo.streets, {
    style: (f) => ({
      color: f.properties.name ? '#f4d35e' : '#8b9cb3',
      weight: f.properties.name ? 4 : 2,
      opacity: 0.9,
    }),
    onEachFeature: (feature, layer) => {
      const name = feature.properties.name;
      if (name) {
        layer.bindPopup(
          `<strong>${name}</strong><br><span style="color:#8b9cb3">${feature.properties.highway}</span>`
        );
      }
    },
  }).addTo(map);

  layers.buildings = L.geoJSON(geo.buildings, {
    style: {
      fillColor: '#6c7a9c',
      fillOpacity: 0.35,
      color: '#4a5568',
      weight: 1,
    },
    onEachFeature: (feature, layer) => {
      const name = feature.properties.name;
      if (name) layer.bindPopup(`<strong>${name}</strong><br>Edificio`);
    },
  }).addTo(map);

  layers.locales = L.geoJSON(geo.locales, {
    pointToLayer: (feature, latlng) => {
      const cat = feature.properties.category;
      const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.local;
      return L.circleMarker(latlng, {
        radius: 6,
        fillColor: color,
        color: '#fff',
        weight: 1,
        fillOpacity: 0.95,
      });
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties;
      layer.bindPopup(
        `<strong>${p.name}</strong><br><span style="color:#8b9cb3">${p.category}</span>`
      );
    },
  }).addTo(map);

  const bounds = L.latLngBounds(
    [meta.bounds.south, meta.bounds.west],
    [meta.bounds.north, meta.bounds.east]
  );
  map.fitBounds(bounds, { padding: [20, 20] });

  document.getElementById('stat-streets').textContent = meta.meta.counts.streets;
  document.getElementById('stat-named').textContent = meta.meta.counts.streetsNamed;
  document.getElementById('stat-buildings').textContent = meta.meta.counts.buildings;
  document.getElementById('stat-locales').textContent = meta.meta.counts.locales;

  wireToggles();
  map.invalidateSize();
}

function wireToggles() {
  const bind = (id, key) => {
    const el = document.getElementById(id);
    el.addEventListener('change', () => {
      if (el.checked) map.addLayer(layers[key]);
      else map.removeLayer(layers[key]);
    });
  };
  bind('toggle-streets', 'streets');
  bind('toggle-buildings', 'buildings');
  bind('toggle-locales', 'locales');
}

export function refreshDesignMap() {
  if (map) setTimeout(() => map.invalidateSize(), 100);
}
