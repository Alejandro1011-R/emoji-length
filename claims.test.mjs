// Every number the page's text states, checked against the model.
// Run: node --test claims.test.mjs
// Invisible characters are written as escapes: \u00e9 is é in one piece,
// e\u0301 is e plus an accent, \u200d is the zero-width joiner (ZWJ).
import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze, count, toSurrogates } from "./model.js";

const counts = (text) => count(analyze(text));

test("1 / 4: one thumbs-up, 2 characters, length 4", () => {
  assert.deepEqual(counts("👍🏽"), { seen: 1, chars: 2, units: 4 });
});

test("2 / 4: a box holds up to 65,535; a is 97, one box; 😀 is 128,512, two boxes", () => {
  assert.equal(counts("\uffff").units, 1); // 65,535, the biggest number one box holds
  assert.equal(counts("\u{10000}").units, 2); // 65,536 needs two
  assert.equal("a".codePointAt(0), 97);
  assert.equal(counts("a").units, 1);
  assert.equal("😀".codePointAt(0), 128512);
  assert.equal(counts("😀").units, 2);
  assert.deepEqual(toSurrogates(0x1f600), [0xd83d, 0xde00]);
  assert.equal(counts("€").units, 1);
});

test("3 / 4: a skin tone is a second character; the family is one picture, eleven boxes", () => {
  assert.deepEqual(counts("👍"), { seen: 1, chars: 1, units: 2 });
  assert.deepEqual(counts("👨\u200d👩\u200d👧\u200d👦"), { seen: 1, chars: 7, units: 11 });
  const families = ["👨", "👨\u200d👧", "👨\u200d👩\u200d👧", "👨\u200d👩\u200d👧\u200d👦"]; // the four buttons
  assert.deepEqual(families.map((family) => counts(family).units), [2, 5, 8, 11]);
});

test("4 / 4: .slice(0, 3) cuts 👍🏽 in half; e + accent looks like é and takes 2", () => {
  assert.equal("👍🏽".slice(0, 3), "👍\ud83c"); // \ud83c: the first half of 🏽, alone
  assert.deepEqual(counts("\u00e9"), { seen: 1, chars: 1, units: 1 });
  assert.deepEqual(counts("e\u0301"), { seen: 1, chars: 2, units: 2 });
  assert.deepEqual(counts("🇪🇸"), { seen: 1, chars: 2, units: 4 });
});

test("the model's boxes are exactly what JavaScript stores", () => {
  for (const text of ["hi", "\u00e9", "e\u0301", "😀", "👍🏽", "🇪🇸", "👨\u200d👩\u200d👧\u200d👦", "Ñandú 🦩"]) {
    const units = analyze(text).flatMap((group) => group.chars).flatMap((char) => char.units);
    const stored = [...Array(text.length).keys()].map((i) => text.charCodeAt(i));
    assert.deepEqual(units, stored);
  }
});
