/**
 * Placeholder copy.
 *
 * Everything STEM MEDICA has not supplied yet is lorem ipsum on purpose, so no
 * invented specification, lead time or clinical claim can be mistaken for a real
 * one. Real data in this build is limited to: company details, contact channels,
 * and device names/brands/origins taken from their own public
 * posts. Replace these strings as the real content arrives.
 */
export const LOREM = {
  short: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  medium:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
  long: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
  title: "Lorem ipsum dolor sit amet consectetur",
  value: "Lorem ipsum",
  valueAlt: "Dolor sit amet",
  word: "Lorem",
} as const;

/** Deterministic variety so repeated placeholders don't look copy-pasted. */
const POOL = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur.",
];

export const loremAt = (i: number) => POOL[i % POOL.length];

const VALUES = [
  "Lorem ipsum", "Dolor sit", "Amet 00", "Consectetur", "Adipiscing 0.0", "Elit sed",
];
export const loremValue = (i: number) => VALUES[i % VALUES.length];
