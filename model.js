// The idea itself: how JavaScript stores a piece of text.
// No DOM here, so it also runs in Node and every claim can be a test.

// Splits text into what a person sees as one character (a "grapheme").
const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

// A character with a number above 0xFFFF doesn't fit in one 16-bit box,
// so UTF-16 splits it into two boxes (a "surrogate pair").
export function toSurrogates(code) {
  const rest = code - 0x10000; // a 20-bit number, from 0 to 0xFFFFF
  const high = 0xd800 + (rest >> 10); // the top 10 bits
  const low = 0xdc00 + (rest & 0x3ff); // the bottom 10 bits
  return [high, low];
}

// The same text seen three ways, one inside the other:
// what you see > the characters (code points) > the 16-bit boxes (code units).
export function analyze(text) {
  return [...segmenter.segment(text)].map(({ segment }) => ({
    text: segment,
    chars: [...segment].map((char) => {
      const code = char.codePointAt(0);
      return { char, code, units: code > 0xffff ? toSurrogates(code) : [code] };
    }),
  }));
}

// The three counts, derived from analyze(): nothing is stored twice.
export function count(groups) {
  const chars = groups.flatMap((group) => group.chars);
  return {
    seen: groups.length,
    chars: chars.length,
    units: chars.flatMap((char) => char.units).length,
  };
}
