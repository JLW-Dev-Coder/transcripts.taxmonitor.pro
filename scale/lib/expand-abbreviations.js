/**
 * expand-abbreviations.js
 *
 * Expands common city and DBA abbreviations in title-cased text.
 * Matches whole words only (case-insensitive). Does not expand
 * partial matches within longer words.
 *
 * Usage:
 *   const { expandAbbreviations } = require('./expand-abbreviations');
 *   expandAbbreviations('Woodland Hls')  // → 'Woodland Hills'
 */

const ABBREVIATION_MAP = {
  // --- City / geographic abbreviations ---
  'Hls': 'Hills',
  'Spgs': 'Springs',
  'Hts': 'Heights',
  'Mtn': 'Mountain',
  'Mtns': 'Mountains',
  'Vlg': 'Village',
  'Ctr': 'Center',
  'Xing': 'Crossing',
  'Jct': 'Junction',
  'Blvd': 'Boulevard',
  'Pkwy': 'Parkway',
  'Ste': 'Suite',
  'Bch': 'Beach',
  'Lk': 'Lake',
  'Lks': 'Lakes',
  'Crk': 'Creek',
  'Fls': 'Falls',
  'Rdg': 'Ridge',
  'Mdws': 'Meadows',
  'Hl': 'Hill',
  'Vly': 'Valley',
  'Brg': 'Bridge',
  'Frk': 'Fork',
  'Frks': 'Forks',
  'Hvn': 'Haven',
  'Hbr': 'Harbor',
  'Ist': 'Island',
  'Mnr': 'Manor',
  'Prt': 'Port',
  'Riv': 'River',
  'Shrs': 'Shores',
  'Trl': 'Trail',
  'Cty': 'City',
  'Rch': 'Rancho',
  'Huntingtn': 'Huntington',

  // --- Business / DBA abbreviations ---
  'Mgmt': 'Management',
  'Svcs': 'Services',
  'Svc': 'Service',
  'Assoc': 'Associates',
  'Acct': 'Accounting',
  'Acctg': 'Accounting',
  'Grp': 'Group',
  'Intl': 'International',
  'Natl': 'National',
  'Prof': 'Professional',
  'Conslt': 'Consulting',
  'Consltg': 'Consulting',
  'Admin': 'Administration',
};

// Build a single regex that matches any abbreviation as a whole word.
// Sort by length descending so longer abbreviations match first
// (e.g., "Consltg" before "Conslt").
const sortedKeys = Object.keys(ABBREVIATION_MAP).sort((a, b) => b.length - a.length);
const pattern = new RegExp(
  '\\b(' + sortedKeys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b',
  'gi'
);

// End-of-string expansions — only match at the very end of the string
// so they don't collide with mid-string words like "Lloyd".
const END_OF_STRING_RULES = [
  { match: /,\s*LL$/i, replacement: ', LLC' },
];

/**
 * Expand abbreviations in a title-cased string.
 * Matches whole words only, case-insensitive.
 * Preserves surrounding punctuation and spacing.
 *
 * @param {string} text - Title-cased input string
 * @returns {string} String with abbreviations expanded
 */
function expandAbbreviations(text) {
  if (!text) return text;
  let result = text.replace(pattern, (match) => {
    // Look up using title-cased version of match
    const titleKey = match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
    return ABBREVIATION_MAP[titleKey] || match;
  });
  for (const rule of END_OF_STRING_RULES) {
    result = result.replace(rule.match, rule.replacement);
  }
  return result;
}

module.exports = { expandAbbreviations, ABBREVIATION_MAP };
