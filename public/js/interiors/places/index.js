import { catedralPlace } from './catedral.place.js';
import { barMomoPlace } from './bar-momo.place.js';
import { riquelaPlace } from './riquela.place.js';
import { modusVivendiPlace } from './modus-vivendi.place.js';
import { areaCentralPlace } from './area-central.place.js';
import { hospitalPlaces } from './hospitals.place.js';

/** Lista de todos os lugares interiores — engade aquí cada instancia nova */
export const ALL_PLACES = [
  catedralPlace,
  barMomoPlace,
  riquelaPlace,
  modusVivendiPlace,
  areaCentralPlace,
  ...hospitalPlaces,
];
