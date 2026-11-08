import { existsSync } from 'node:fs';
import { join } from 'node:path';

// Full-width header photos for the main category pages (files in public/images/).
// `credit` is optional: leave it null for Rob's own photos; for anyone else's photo add
// { photographer, licence, sourceUrl } and it is shown under the header.
export const CATEGORY_HEROES = {
  towns: {
    src: '/images/towns-hero.jpg',
    alt: 'Fishing boats moored in a calm Cornish harbour, with houses climbing the hillside behind',
    position: 'object-[50%_55%]',
    credit: null,
  },
  beaches: {
    src: '/images/beaches-hero.jpg',
    alt: 'Aerial view of turquoise water and pale sandy beaches curving round to a harbour town and headland',
    position: 'object-[50%_45%]',
    credit: null,
  },
  dogs: {
    src: '/images/dogs-hero.jpg',
    alt: 'A happy golden-brown dog lying on a pebble beach with the sea behind',
    position: 'object-[50%_40%]',
    credit: null,
  },
  thingsToDo: {
    src: '/images/things-to-do-hero.jpg',
    alt: 'Two surfers in wetsuits running along the wet sand with their boards, waves breaking behind them',
    position: 'object-[50%_55%]',
    credit: null,
  },
  food: {
    src: '/images/food-hero.jpg',
    alt: 'A plate of seafood linguine with mussels, clams and prawns',
    position: 'object-[50%_50%]',
    credit: null,
  },
};

// True when the photo file is in public/images/ (lets a page fall back to its plain header until then).
export function heroAvailable(hero) {
  return Boolean(hero) && existsSync(join(process.cwd(), 'public', hero.src));
}
