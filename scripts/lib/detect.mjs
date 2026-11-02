// Adapted from the Brighton Beer Guide pipeline.
// Feature detectors. Each returns { value: 'yes' | 'no' | 'unknown', ... } based ONLY on
// sentences found on the venue's own website. Anything not explicitly stated stays 'unknown'.

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// A positive match is ignored if a negation appears shortly before it in the same sentence.
const NEGATION_BEFORE = /\b(no|not|never|don'?t|doesn'?t|isn'?t|aren'?t|won'?t|unfortunately|sorry|without|cannot|can'?t)\b[^.]{0,30}$/i;

// Sentences that are directory/navigation chrome on group sites, not facts about this pub.
const CHROME = /\b(find (a|your) (pub|local)|pubs? near (you|me)|search (for )?pubs|pubs with|all (our )?pubs|book a table at any|cookie|newsletter|if you(')?re interested in|if you are interested in|interested in (running|hosting)|\d+ (\w+ )?pubs (have|are|across)|across (all )?our (pubs|venues)|sign up|privacy policy|terms (and|&) conditions|gift cards?)\b/i;

export const FEATURES = {
  vegan: {
    label: 'Vegan options',
    yes: /\b(vegan (options?|menu|dishes|choices?|friendly|food|alternatives?|available)|plant[- ]based (options?|menu|dishes)|vegans? (are )?(catered|welcome)|caters? for vegans?|\(ve\)|ve = vegan|v ?= ?vegetarian,? ve ?= ?vegan)\b/i,
    no: /\b(no vegan (options?|menu))\b/i,
  },
  vegetarian: {
    label: 'Vegetarian options',
    yes: /\b(vegetarian (options?|menu|dishes|choices?|friendly|food|alternatives?|available)|veggie (options?|menu|dishes|friendly|choices?)|vegetarians? (are )?(catered|welcome)|caters? for vegetarians?|v ?= ?vegetarian|\(v\) ?=)\b/i,
    no: /\b(no vegetarian (options?|menu))\b/i,
  },
  glutenFree: {
    label: 'Gluten-free options',
    yes: /\b(gluten[- ]free (options?|menu|dishes|choices?|bread|buns?|bases?|alternatives?|available|friendly|pizza|food)|gf (options?|available|menu)|coeliac[- ]friendly|cater(s|ing)? for (coeliacs?|gluten)|\(gf\)|gf ?= ?gluten[- ]free)\b/i,
    no: /\b(no gluten[- ]free (options?|menu)|cannot (cater|guarantee)[^.]{0,40}gluten|not suitable for coeliacs)\b/i,
  },
  seaView: {
    label: 'Sea views',
    yes: /\b(sea views?|views? (over|across|of) (the )?(sea|harbour|bay|beach|estuary|ocean|atlantic|coast)|overlooking (the )?(sea|harbour|bay|beach|estuary|ocean|atlantic|cove)|(harbour|harbourside|beachside|waterside|seafront|sea[- ]front|on the beach|right on the beach|beach[- ]front|clifftop|cliff[- ]top) (pub|inn|bar|restaurant|cafe|café|bistro|location|setting|terrace|views?(?! (house|road|terrace|close|park|holiday|cottage|apartments?)))|ocean views?|views? out to sea|panoramic views)\b/i,
    no: /\b(no sea views?)\b/i,
  },
  familyFriendly: {
    label: 'Children welcome',
    yes: /\b(child(ren)?'?s menu|kids'? menu|menu for (the )?(little ones|children|kids)|family[- ]friendly|children (are )?(very )?welcome|kids (are )?welcome|families (are )?(very )?welcome|high ?chairs?|baby[- ]changing)\b/i,
    no: /\b(no (children|kids)|adults only|over 18s only|children (are )?not (allowed|permitted))\b/i,
  },
  outdoorSeating: {
    label: 'Outdoor seating',
    yes: /\b(outdoor (seating|tables|dining|area)|outside (seating|tables|dining|area)|al ?fresco|(our|sun|sunny|outdoor|outside|garden|front|back|rear|dog[- ]friendly|decked|heated|covered|beachside|waterside|riverside|harbourside|south[- ]facing|large|big|lovely|beautiful) (terrace|patio|decking)|on the (terrace|patio|decking)|seating outside|eat outside|sit outside|picnic benches)\b/i,
    no: /\b(no outdoor (seating|area)|no outside (seating|area))\b/i,
  },
  beerGarden: {
    label: 'Beer garden',
    yes: /\b(beer gardens?|pub gardens?|our (lovely |large |big |beautiful |sunny |secret |walled |hidden )?gardens?|(lovely|large|big|sunny|beautiful|back|rear|pub) garden|garden bar|roof ?terrace|rooftop (bar|terrace|garden)|courtyard( garden)?|walled garden|secret garden|sun ?terrace|suntrap|sun trap)\b/i,
    no: /\b(no (beer )?garden|(we )?(do not|don'?t) have (a )?(beer )?garden)\b/i,
  },
  dogFriendly: {
    label: 'Dog friendly',
    yes: /\b(dog[- ]friendly|(?<!(assistance|guide|service) )dogs (are )?(very |always |more than |most )?welcome|well[- ]behaved dogs|four[- ]legged (friends|guests|companions)|dogs (are )?allowed|water bowls? for (your )?dogs|doggy (treats|biscuits)|dog treats|bring (your|the) dogs?|pooch(es)?)\b/i,
    no: /\b(no dogs|dogs (are )?not (allowed|permitted)|(only )?(assistance|guide) dogs only|not dog[- ]friendly)\b/i,
  },
  liveMusic: {
    label: 'Live music',
    yes: /\b(live music(?! round)|live bands?|open mic|acoustic (nights?|sessions?|sets?)|jazz (nights?|sessions?|evenings?)|folk (nights?|sessions?|club)|jam sessions?|live (acts|performances?|gigs?)|gigs (every|each|most|on|throughout|and events)|blues (nights?|jam))\b/i,
    no: /\b(no live music)\b/i,
  },
  pubQuiz: {
    label: 'Pub quiz',
    yes: /\b(pub quiz|quiz nights?|quiz(zes)?)\b(?! machine)/i,
    no: /\b(no (pub )?quiz)\b/i,
  },
  sundayRoast: {
    label: 'Sunday roast',
    yes: /\b(sunday roasts?|sunday lunch(es)?|roast dinners?|sunday carvery|roasts (are )?served|our roasts?)\b/i,
    no: /\b(no (sunday )?roasts?)\b/i,
  },
  food: {
    label: 'Food served',
    yes: /\b(food menu|our food|food (is )?served|serving food|serve food|kitchen (is )?open|kitchen hours|food (served )?(daily|every day)|lunch menu|dinner menu|main menu|evening menu|bar snacks|small plates|sunday roasts?|our food menu|pizzas?|burgers?|food times|food hours|kitchen opening)\b/i,
    no: /\b(we (do not|don'?t) (serve|do|offer) food|no food( served)?|drinks only|we (do not|don'?t) have a kitchen)\b/i,
  },
  realAle: {
    label: 'Real ale',
    yes: /\b(real ales?|cask ales?|cask beers?|cask[- ]conditioned|cask marque|camra|hand[- ]?pulls?|hand[- ]?pumps?|on cask|from the cask)\b/i,
    no: /\b(no (real|cask) ales?)\b/i,
  },
};

export function splitSentences(text) {
  return text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length >= 4 && s.length <= 400);
}

function clipAround(s, idx, n = 180) {
  if (s.length <= n) return s;
  const start = Math.max(0, Math.min(idx - 60, s.length - n));
  return (start > 0 ? '…' : '') + s.slice(start, start + n).trim() + (start + n < s.length ? '…' : '');
}

function clip(s, n = 180) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

// pages: [{ url, text }]
export function detectAll(pages) {
  const result = {};
  for (const [key, f] of Object.entries(FEATURES)) {
    let yes = null;
    let no = null;
    for (const page of pages) {
      const sentences = splitSentences(page.text);
      sentences.forEach((s, i) => {
        if (CHROME.test(s)) return;
        // FAQ-style questions ("Are dogs allowed?") are only evidence via their answer.
        if (/\?\s*$/.test(s) && (f.yes.test(s) || f.no.test(s))) {
          const ans = sentences[i + 1] || '';
          const quote = clip(`${s} ${ans}`, 220);
          if (!yes && /^(yes|yep|absolutely|of course|we (are|do|have)|definitely)\b/i.test(ans)) yes = { url: page.url, quote };
          else if (!no && /^(no\b|unfortunately|sorry|sadly|we (are not|aren'?t|do not|don'?t))/i.test(ans)) no = { url: page.url, quote };
          return;
        }
        const nm = s.match(f.no);
        if (!no && nm) no = { url: page.url, quote: clipAround(s, nm.index) };
        const m = s.match(f.yes);
        if (!yes && m) {
          const before = s.slice(0, m.index);
          if (!NEGATION_BEFORE.test(before) && !nm) yes = { url: page.url, quote: clipAround(s, m.index) };
        }
      });
    }
    let value = 'unknown';
    let evidence = null;
    if (yes && no) evidence = { conflict: true, yes, no }; // contradictory: leave unknown for review
    else if (yes) (value = 'yes'), (evidence = yes);
    else if (no) (value = 'no'), (evidence = no);
    result[key] = { value, evidence };
  }
  // Quiz day(s): only from sentences that mention the quiz.
  if (result.pubQuiz.value === 'yes') result.pubQuiz.days = quizDays(pages);
  return result;
}

function quizDays(pages) {
  const found = new Set();
  for (const page of pages) {
    for (const s of splitSentences(page.text)) {
      if (CHROME.test(s) || !FEATURES.pubQuiz.yes.test(s)) continue;
      const lower = s.toLowerCase();
      // Prefer the day closest to the word "quiz" in the sentence.
      const qi = lower.search(/quiz/);
      let best = null;
      for (const d of DAYS) {
        const re = new RegExp(`\\b${d}s?\\b|\\b${d.slice(0, 3)}s?\\b(?=[\\s:,.-])`, 'g');
        let m;
        while ((m = re.exec(lower))) {
          const dist = Math.abs(m.index - qi);
          if (dist <= 60 && (!best || dist < best.dist)) best = { d, dist };
        }
      }
      if (best) found.add(best.d);
    }
  }
  return DAYS.filter((d) => found.has(d)).map((d) => d[0].toUpperCase() + d.slice(1));
}
