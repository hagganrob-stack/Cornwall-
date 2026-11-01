// Hand-checked matches between OSM beach names and official lists whose names differ.
// Review data/raw/match-report.json after each run for anything left unmatched.

// Cornwall Council dog-restriction entry id -> OSM beach names. Each name is a string (exact),
// a RegExp, or { name, near: [lat, lng] } to pick one of several same-named beaches (must be within 3 km).
// Council entries with no named OSM beach (estuaries, pools, harbour frontages, beaches not mapped
// as natural=beach) are deliberately absent and show up in data/raw/match-report.json.
export const DOG_MATCHES = {
  'carbis-bay-beach-carbis-bay': ['Carbis Bay Beach'],
  'chapel-porth-beach-st-agnes': ['Chapel Porth Beach'],
  'church-cove-gunwalloe': [{ name: 'Church Cove', near: [50.0383, -5.2676] }],
  'crooklets-beach-bude': ['Crooklets Beach'],
  'gyllyngvase-beach-falmouth': ['Gyllyngvase Beach'],
  'hoodny-beach-portwrinkle': ['Hoodny Cove'],
  'housel-bay-the-lizard': ['Housel Bay'],
  'kennack-sands-beach-the-lizard': ['Kennack Sands'],
  'maenporth-beach-falmouth': ['Maenporth Beach'],
  perranuthnoe: ['Perranuthnoe Beach'],
  'poldhu-beach-mullion': ['Poldhu Cove'],
  'polzeath-beach-polzeath': [{ name: 'Hayle Bay', near: [50.5771, -4.9191] }], // OSM name for Polzeath beach
  'porth-beach-porth': ['Porth Beach'],
  'porthcurno-beach-porthcurno': ['Porthcurno'],
  'porthgwarra-beach-st-levan': ['Porthgwarra'],
  'porthgwidden-beach-st-ives': ['Porthgwidden Beach'],
  'porthleven-west-porthleven': ['Porthleven Sands'], // the beach west of Porthleven harbour
  'porthmeor-beach-st-ives': ['Porthmeor Beach'],
  'porthminster-beach-st-ives': ['Porthminster Beach'],
  'porthpean-beach-st-austell': ['Porthpean Beach'],
  'porthtowan-beach-porthtowan': ['Porthtowan Beach'],
  'portreath-beach-including-harbour-portreath': ['Portreath Beach'],
  'praa-sands-beach-praa-sands': ['Praa Sands'],
  'readymoney-cove-fowey': ['Readymoney Cove Beach'],
  'sennen-beach-sennen': ['Sennen Cove'], // main beach at Sennen Cove (Gwynver is separate and unrestricted)
  'st-ives-harbour-beach-st-ives': [{ name: 'Harbour Beach', near: [50.2137, -5.4782] }],
  'swanpool-beach-falmouth': ['Swanpool Beach'],
  'trevone-beach-padstow': ['Trevone Beach'],
  'widemouth-beach-bude': ['Widemouth Sands'],
  'summerleaze-bude': ['Summerleaze Beach'],
};

// OSM beach name, or OSM id ("relation/123") where a name is shared -> RNLI lifeguard unit name
// (null = never match, even by distance). An id key takes precedence over a name key.
export const LIFEGUARD_MATCHES = {
  'Hayle Bay': 'Polzeath', // OSM name for Polzeath beach
  'relation/2177116': 'Perran Sands', // northern part of Perran Beach
  'relation/2177117': 'Perranporth', // southern part, at Perranporth itself
};

// OSM "beaches" that aren't visitor beaches (tidal mud banks, private estate frontages...).
export const EXCLUDE_NAMES = [];
