// The explanation as data. Each step sets the text the reader starts from
// and lists the controls the reader has. Controls appear a few at a time.
export const STEPS = [
  {
    // The question. The figure stays hidden until the reader guesses.
    text: "You see one thumbs-up, and JavaScript says its length is 4. What's inside it? Guess how many characters it's made of, then look.",
    set: { text: "👍🏽" },
    controls: ["guess"],
    ask: true,
  },
  {
    // The first touch: type, or pick a character.
    text: "JavaScript stores text in boxes of 16 bits, and .length counts the boxes. Type something, or pick a character below. A letter takes one box, and so do é and €. Now pick 😀.",
    set: { text: "hi" },
    controls: ["text", "picks"],
  },
  {
    // The second control, brought in by "Therefore".
    text: "Therefore some characters don't fit in one box. A box holds numbers up to 65,535 (FFFF), and 😀 is number 128,512 (1F600), so it is split across two boxes. Now give 👍 a skin tone.",
    set: { text: "👍" },
    controls: ["tone"],
  },
  {
    // The surprise, from the defaults: one emoji, eleven boxes.
    text: "But one emoji can hold several characters. This family is four people glued together by an invisible character, the zero-width joiner (ZWJ). Take people away and add them back: one picture the whole time.",
    set: { text: "👨\u200d👩\u200d👧\u200d👦" }, // \u200d is the invisible ZWJ
    controls: ["family"],
  },
  {
    // The rule, in words.
    text: "So .length counts boxes, not what you see. Anything that cuts text by length can cut a character in half, like .slice(0, 3) below. To count what a person sees, use Intl.Segmenter.",
    set: { text: "👍🏽" },
    controls: ["slice"],
  },
  {
    // The sandbox: every control.
    text: "Your turn. Try your name, a flag, or é written as e plus an accent: it looks the same and takes two boxes. What's the longest single emoji you can find?",
    set: { text: "🇪🇸" },
    controls: ["text", "picks", "slice"],
  },
];
