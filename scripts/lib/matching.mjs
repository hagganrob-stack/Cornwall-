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
  // Beaches added via EXTRA_BEACHES:
  'cadgwith-cove-cadgwith': ['Cadgwith Cove'],
  'cawsand-beach-cawsand': ['Cawsand Beach'],
  'crackington-haven-bude': ['Crackington Haven'],
  'harveys-towans-godrevy-point-hayle': ['Hayle Towans Beach', 'Gwithian Beach', 'Godrevy Beach'], // one order covers the whole stretch
  'kynance-cove-the-lizard': ['Kynance Cove'],
  'mousehole-beach-to-skilly-beach': ['Mousehole Beach'],
  'wherry-town-to-battery-rocks': ['Wherry Town Beach'],
  'longrock-level-crossing-to-marazion': ['Long Rock Beach', 'Marazion Beach'],
  'polurrian-cove-beach-mullion': ['Polurrian Cove'],
  'portmellon-cove-mevagissey': ['Portmellon Cove'],
  'portwrinkle-harbour': ['Portwrinkle Harbour Beach'],
  'st-georges-well-padstow': ["St George's Cove"],
  'summers-beach-st-mawes': ['Summers Beach'],
  'tattams-beach-portscatho': ['Tattams Beach'],
  'tunnel-beach-falmouth': ['Tunnel Beach'],
};

// OSM beach name, or OSM id ("relation/123") where a name is shared -> RNLI lifeguard unit name
// (null = never match, even by distance). An id key takes precedence over a name key.
export const LIFEGUARD_MATCHES = {
  'Hayle Bay': 'Polzeath', // OSM name for Polzeath beach
  'relation/2177116': 'Perran Sands', // northern part of Perran Beach
  'relation/2177117': 'Perranporth', // southern part, at Perranporth itself
  // Beaches added via EXTRA_BEACHES:
  'Marazion Beach': 'Marazion',
  'Long Rock Beach': null, // touches Marazion; the RNLI unit is listed once, on Marazion Beach
  'Crackington Haven': 'Crackington Haven',
  'Godrevy Beach': 'Godrevy',
  'Gwithian Beach': 'Gwithian North',
  'Hayle Towans Beach': 'Hayle Towans',
  'Trebarwith Strand': 'Trebarwith',
  'Tregantle Beach': 'Tregantle',
  'Freathy Beach': 'Freathy',
  'Tregonhawke Beach': 'Tregonhawke',
};

// OSM "beaches" that aren't visitor beaches (tidal mud banks, private estate frontages...).
export const EXCLUDE_NAMES = [
  /^Pedn-y-ke$/, // OSM name on the Polurrian Cove sand; re-added below as "Polurrian Cove"
];

// Well-known beaches with no NAMED natural=beach feature in OSM (the sand is mapped unnamed, or only
// the bay/cove is named). Each pins a visitor-facing name to one specific OSM feature, which supplies
// the location, outline and tags. `osm` is one id or several pieces (merged into one beach); a
// node (village or bay point) is used only where no beach outline is mapped. `why` records the reason.
const DOG = 'On the Cornwall Council dog-restriction list';
const RNLI = 'RNLI lifeguarded beach';
export const EXTRA_BEACHES = [
  { name: 'Kynance Cove', osm: ['way/806052833', 'way/806052832'], why: DOG },
  { name: 'Marazion Beach', osm: ['way/1379189903', 'way/777263840'], why: `${DOG}; ${RNLI}` },
  { name: 'Long Rock Beach', osm: ['way/304641319', 'way/304356215'], why: DOG },
  { name: 'Crackington Haven', osm: ['way/174329462', 'way/1201179415'], why: `${DOG}; ${RNLI}` },
  { name: 'Cawsand Beach', osm: ['way/225174218', 'way/998427718'], why: DOG },
  { name: 'Mousehole Beach', osm: 'way/112525060', why: DOG },
  { name: 'Godrevy Beach', osm: ['way/888289247', 'way/888270743'], why: `${DOG}; ${RNLI}` },
  { name: 'Gwithian Beach', osm: 'way/889139690', why: `${DOG}; ${RNLI}` },
  { name: 'Hayle Towans Beach', osm: 'way/183752234', why: `${DOG}; ${RNLI}` },
  { name: 'Trebarwith Strand', osm: ['way/316315372', 'way/1175389713'], why: RNLI },
  { name: 'Tregantle Beach', osm: ['way/289885394', 'way/1200952703'], why: RNLI },
  { name: 'Freathy Beach', osm: ['way/225176331', 'way/998195545'], why: RNLI },
  { name: 'Tregonhawke Beach', osm: 'way/225175786', why: RNLI },
  { name: 'Cadgwith Cove', osm: 'node/29282484', why: `${DOG} (no beach outline mapped; located at Cadgwith village)` },
  { name: 'Tunnel Beach', osm: 'way/471365539', why: DOG },
  { name: 'Polurrian Cove', osm: 'way/191932830', why: DOG },
  { name: 'Portmellon Cove', osm: 'way/162210379', why: DOG },
  { name: 'Summers Beach', osm: 'way/1521269265', why: DOG },
  { name: 'Tattams Beach', osm: 'way/169472721', why: DOG },
  { name: 'Portwrinkle Harbour Beach', osm: 'way/997966126', why: DOG },
  { name: 'Wherry Town Beach', osm: 'way/1009579600', why: DOG },
  { name: "St George's Cove", osm: 'way/866442991', why: DOG },
];

// Attractions: Google place_ids or exact Google titles to leave out (not visitor attractions, closed, duplicates).
export const ATTRACTION_EXCLUDE = [
  // Not visitor attractions: car parks, shops, food & drink, harbour authorities, local recreation grounds.
  'Bude Town Centre', 'Pendennis Castle Car Park', 'Land\'s End Sign', 'Roly\'s Fudge Pantry Looe', 'Treguddick Distillery',
  'Field of Dreams', 'Launceston Road Recreation Ground', 'Cargreen Park', 'Camborne Park', 'Porthleven Harbour & Dock Co',
  'Mevagissey Harbour', 'Polperro Harbour', 'Boscastle Harbour', 'Little Petherick Creek Bridge - Camel Trail',
];
// Google title -> the name we show, where Google's listing title is a marketing string.
export const ATTRACTION_RENAME = {
  'Paradise Park and JungleBarn Cornwall': 'Paradise Park and JungleBarn',
  'Bodmin Railway - Boscarne Junction Station': 'Bodmin & Wenford Railway (Boscarne Junction)',
};
