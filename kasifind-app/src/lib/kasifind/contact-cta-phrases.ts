/** Friendly / playful listing-card contact footer lines (Group A). */
export const CONTACT_CTA_GROUP_A = [
  "Let's make a plan!",
  "Give them a shout!",
  "What's the damage? 😁",
  "Get the ball rolling!",
  "Let's talk business!",
  "Don't be shy!",
  "Make that call!",
  "Go on, ask!",
  "Your next connection starts here!",
  "Let's get this sorted!",
] as const;

/** Cheeky / random listing-card contact footer lines (Group B). */
export const CONTACT_CTA_GROUP_B = [
  "Well, what are you waiting for?",
  "Push the button, Bruce!",
  "Make someone's day!",
  "It's go time!",
  "Dial-a-deal!",
  "Don't just stare at it!",
  "Your move, legend!",
  "Let's make magic happen!",
  "Be the reason their phone rings!",
  "Fortune favours the bold!",
  "Sho! Let's talk!",
  "What could possibly go wrong?",
] as const;

export const ALL_CONTACT_CTA_PHRASES: readonly string[] = [
  ...CONTACT_CTA_GROUP_A,
  ...CONTACT_CTA_GROUP_B,
];

export type ContactCtaRandom = () => number;

function shuffleInPlace<T>(items: T[], random: ContactCtaRandom): void {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = items[i]!;
    items[i] = items[j]!;
    items[j] = tmp;
  }
}

/**
 * Assigns one phrase per listing in display order. Stable for a given call;
 * callers should memoize against search/filter scope, not every render.
 */
export function assignListingContactCtaPhrases(
  listingIds: readonly string[],
  random: ContactCtaRandom = Math.random
): Map<string, string> {
  const out = new Map<string, string>();
  if (listingIds.length === 0) return out;

  const pool = [...ALL_CONTACT_CTA_PHRASES];
  shuffleInPlace(pool, random);

  let prev: string | null = null;
  let poolIndex = 0;

  for (const id of listingIds) {
    let phrase = pool[poolIndex % pool.length]!;
    if (phrase === prev && pool.length > 1) {
      for (let offset = 1; offset < pool.length; offset++) {
        const candidate = pool[(poolIndex + offset) % pool.length]!;
        if (candidate !== prev) {
          phrase = candidate;
          poolIndex += offset;
          break;
        }
      }
    }
    out.set(id, phrase);
    prev = phrase;
    poolIndex += 1;
  }

  return out;
}
