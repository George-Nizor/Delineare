// Prompts for drawing invented things. The word lists are written for Delineare; mixing two
// unrelated things is the exercise, so the lists are deliberately broad and ordinary.

const THINGS = [
  'teapot', 'lighthouse', 'snail', 'armchair', 'bicycle', 'owl', 'cactus', 'umbrella', 'tortoise', 'lantern',
  'boot', 'crab', 'windmill', 'kettle', 'heron', 'tram', 'mushroom', 'anchor', 'fox', 'grand piano',
  'beetle', 'hot-air balloon', 'cat', 'typewriter', 'pine cone', 'octopus', 'wheelbarrow', 'clock tower',
  'sea urchin', 'camera', 'ram', 'garden shed', 'jellyfish', 'telescope', 'pear', 'submarine', 'moth',
  'stool', 'lobster', 'kite', 'bulldozer', 'chameleon', 'violin', 'tent', 'axolotl', 'boot scraper',
  'magpie', 'vacuum cleaner', 'artichoke', 'rhinoceros', 'bus shelter', 'seahorse', 'loaf of bread',
];

const QUALITIES = [
  'made of folded paper', 'very old and patched up', 'built from stone', 'floating', 'asleep', 'enormous',
  'tiny and carried by ants', 'covered in moss', 'made of glass', 'running away', 'wearing armour',
  'half underwater', 'in a storm', 'stacked three high', 'lit from below', 'seen from directly above',
  'knitted', 'made of driftwood', 'on stilts', 'melting slightly', 'in the shape of a house', 'mechanical',
];

const VIEWS = [
  'from a low angle', 'from above', 'in three-quarter view', 'as a silhouette first', 'three times from three sides',
  'in two-point perspective', 'with one light from the left', 'in under five minutes', 'with only ten lines',
];

function pick<T>(list: readonly T[], random: () => number): T {
  return list[Math.floor(random() * list.length)]!;
}

// A small seeded generator, so a prompt can be shown again for the same session.
export function seeded(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export interface Prompt {
  text: string;
  parts: string[];
}

export function makePrompt(random: () => number = Math.random): Prompt {
  const first = pick(THINGS, random);
  let second = pick(THINGS, random);
  while (second === first) second = pick(THINGS, random);
  const shape = Math.floor(random() * 3);
  if (shape === 0) {
    const text = `A ${first} that is also a ${second}, ${pick(VIEWS, random)}`;
    return { text, parts: [first, second] };
  }
  if (shape === 1) {
    const quality = pick(QUALITIES, random);
    return { text: `A ${first}, ${quality}, ${pick(VIEWS, random)}`, parts: [first, quality] };
  }
  return { text: `A creature that lives inside a ${first} and eats ${second}s`, parts: [first, second] };
}
