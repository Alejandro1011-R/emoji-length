// Every number the steps' text states, checked against the model.
// Run: node --test claims.test.mjs
// Invisible characters are written as escapes: é is é in one piece,
// é is e plus an accent, ‍ is the zero-width joiner (ZWJ).
import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze, count, toSurrogates } from "./model.js";
import { STEPS } from "./steps.js";

const counts = (text) => count(analyze(text));

test("1 / 6: one emoji, length 4", () => {
  assert.equal(STEPS[0].set.text, "👍🏽");
  assert.deepEqual(counts("👍🏽"), { seen: 1, chars: 2, units: 4 });
});

test("2 / 6: a letter, é and € take one box each; 😀 takes two", () => {
  assert.equal(counts("hi").units, 2);
  assert.equal(counts("é").units, 1);
  assert.equal(counts("€").units, 1);
  assert.equal(counts("😀").units, 2);
});

test("3 / 6: a box holds up to 65,535; 😀 is 128,512 and splits into two boxes", () => {
  assert.equal(0xffff, 65535);
  assert.equal("😀".codePointAt(0), 128512);
  assert.deepEqual(toSurrogates(0x1f600), [0xd83d, 0xde00]);
  for (const tone of ["🏻", "🏼", "🏽", "🏾", "🏿"]) {
    assert.equal(counts("👍" + tone).units, 4);
  }
});

test("4 / 6: the family is one picture, 11 boxes; each person adds 3", () => {
  assert.deepEqual(counts(STEPS[3].set.text), { seen: 1, chars: 7, units: 11 });
  const families = ["👨", "👨‍👧", "👨‍👩‍👧", "👨‍👩‍👧‍👦"]; // the four buttons
  assert.deepEqual(families.map((family) => counts(family).units), [2, 5, 8, 11]);
});

test("5 / 6: .slice(0, 3) cuts 👍🏽 in half", () => {
  assert.equal("👍🏽".slice(0, 3), "👍\ud83c"); // \ud83c: the first half of 🏽, alone
});

test("6 / 6: a flag is 4 boxes; e + accent looks like é and takes 2", () => {
  assert.deepEqual(counts("🇪🇸"), { seen: 1, chars: 2, units: 4 });
  assert.deepEqual(counts("é"), { seen: 1, chars: 2, units: 2 });
});

test("the model's boxes are exactly what JavaScript stores", () => {
  for (const text of ["hi", "é", "é", "😀", "👍🏽", "🇪🇸", "👨‍👩‍👧‍👦", "Ñandú 🦩"]) {
    const units = analyze(text).flatMap((group) => group.chars).flatMap((char) => char.units);
    const stored = [...Array(text.length).keys()].map((i) => text.charCodeAt(i));
    assert.deepEqual(units, stored);
  }
});
