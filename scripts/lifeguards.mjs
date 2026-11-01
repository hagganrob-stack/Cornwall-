#!/usr/bin/env node
// RNLI lifeguard units from the RNLI's official open data (ArcGIS Hub "RNLI Lifeguard Units").
// Output: data/lifeguards.json (Cornwall units only). Matched to beaches by name + distance later.
import { cachedFetch, writeJson, TODAY } from './lib/util.mjs';

const LAYER = 'https://services1.arcgis.com/evM5NkxAYjTi6XPw/arcgis/rest/services/RNLI_Lifeguard_Units/FeatureServer/0';
const DATASET = 'https://data-rnli.opendata.arcgis.com/datasets/RNLI::rnli-lifeguard-units';
const gj = await cachedFetch(`${LAYER}/query?where=1%3D1&outFields=*&outSR=4326&f=geojson`, 'data/raw/rnli/units.geojson');

// Cornwall bounding box (Isles of Scilly excluded); Devon units east of the Tamar filtered by Council_Area.
const units = gj.features
  .map((f) => ({ ...f.properties, lng: f.geometry.coordinates[0], lat: f.geometry.coordinates[1] }))
  .filter((u) => u.lng > -5.8 && u.lng < -4.15 && u.lat > 49.9 && u.lat < 50.95)
  .filter((u) => !u.Council_Area || /cornwall/i.test(u.Council_Area))
  .map((u) => ({
    name: u.Name,
    lat: +u.lat.toFixed(5),
    lng: +u.lng.toFixed(5),
    councilArea: u.Council_Area || null,
    supportCentre: u.Support_Centre || null,
    since: u.Date || null,
    rnliPage: u.Beach_URL || null,
  }));
await writeJson('data/lifeguards.json', {
  source: { label: 'RNLI open data – RNLI Lifeguard Units', url: DATASET, api: LAYER, licence: 'RNLI GIS Open Data Licence', attribution: 'Contains Open Data licensed under the GIS Open Data Licence', retrieved: TODAY },
  note: 'Lifeguard cover is seasonal. Patrol dates and times are published on each RNLI beach page.',
  units,
});
console.log(`${units.length} RNLI lifeguard units in Cornwall`);
console.log([...new Set(units.map((u) => u.councilArea))]);
