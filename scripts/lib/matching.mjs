// Hand-checked matches between OSM beach names and official lists whose names differ.
// Review data/raw/match-report.json after each run for anything left unmatched.

// Cornwall Council dog-restriction entry id -> OSM beach names (string = exact, RegExp = pattern),
// optionally with `near` [lat, lng] to disambiguate duplicate names around Cornwall.
export const DOG_MATCHES = {};

// OSM beach name -> RNLI lifeguard unit name (null = never match, even by distance).
export const LIFEGUARD_MATCHES = {};

// OSM "beaches" that aren't visitor beaches (tidal mud banks, private estate frontages...).
export const EXCLUDE_NAMES = [];
