import { SANTIAGO_SITES } from '../../santiago-sites-data.js';
import { getSiteLayout } from '../layouts/sites/index.js';
import {
  drawSiteChurchDoor,
  drawSiteCivicDoor,
  drawSiteLibraryDoor,
  drawSiteMallDoor,
  drawSiteMarketDoor,
  drawSiteMuseumDoor,
  drawSiteParkDoor,
  drawSiteStadiumDoor,
} from '../door-art.js';

const DOOR_DRAW = {
  market: drawSiteMarketDoor,
  museum: drawSiteMuseumDoor,
  church: drawSiteChurchDoor,
  library: drawSiteLibraryDoor,
  civic: drawSiteCivicDoor,
  park: drawSiteParkDoor,
  mall: drawSiteMallDoor,
  stadium: drawSiteStadiumDoor,
};

const TINTS = [0x90caf9, 0xffcc80, 0xa5d6a7, 0xce93d8, 0xffab91];

function buildPatrons(site) {
  const spec = getSiteLayout(site.id);
  const slots = spec?.patrons ?? [{ tx: 5, ty: 5 }, { tx: 12, ty: 5 }];
  return site.patrons.map((p, i) => {
    const slot = slots[i] || slots[0];
    return {
      id: `${site.id}-p${i}`,
      tx: slot.tx,
      ty: slot.ty,
      tint: TINTS[i % TINTS.length],
      emoji: site.emoji,
      phrases: p.phrases,
    };
  });
}

/** 20 instancias — cada unha con planta propia en layouts/sites/ */
export const santiagoSitePlaces = SANTIAGO_SITES.map((site) => {
  const spec = getSiteLayout(site.id);
  return {
    id: site.id,
    label: site.label,
    enterToast: `Entraches en ${site.label}`,
    exitToast: `Saíches de ${site.label} (${site.exitStreet})`,
    world: { kind: 'lonlat', lon: site.lon, lat: site.lat },
    exit: { kind: 'south', margin: 2.5 },
    layout: () => (spec?.build ? spec.build() : getSiteLayout('museo-pobo-galego').build()),
    door: {
      textureKey: `door-${site.id}`,
      draw: DOOR_DRAW[site.door] || drawSiteMuseumDoor,
      tooltip: site.label,
      sceneKey: `door_${site.id.replace(/-/g, '_')}`,
    },
    actors: {
      chatter: {
        spriteRole: 'bot',
        defaultEmoji: site.emoji,
        intervalMs: 8500,
        bubbleBg: '#e8eef5',
        bubbleColor: '#1a2a3a',
        wordWrap: 150,
        patrons: buildPatrons(site),
      },
    },
  };
});
