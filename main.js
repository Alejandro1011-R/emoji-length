// One state. A render function that reads it. Inputs that change it.
import { analyze, count } from "./model.js";
import { STEPS } from "./steps.js";

// Characters you can't see get a name instead.
const NAMES = {
  0x20: "space",
  0x200d: "ZWJ (glue)",
  0xfe0f: "variation",
  0x301: "accent",
  0x1f3fb: "tone",
  0x1f3fc: "tone",
  0x1f3fd: "tone",
  0x1f3fe: "tone",
  0x1f3ff: "tone",
};

let step = 0;
let state = {};

const $ = (selector) => document.querySelector(selector);

function goTo(n) {
  if (n < 0 || n >= STEPS.length) return; // Back on the first step, Next on the last: do nothing
  step = n;
  state = { ...STEPS[step].set };
  $("#text").textContent = STEPS[step].text; // a live region: write it only when the step changes
  render();
}

function render() {
  const s = STEPS[step];
  const groups = analyze(state.text);
  const counts = count(groups);
  const waiting = s.ask && state.guess === undefined;

  $("#count").textContent = `${step + 1} / ${STEPS.length}`;
  for (const control of document.querySelectorAll("[data-control]")) {
    control.hidden = !s.controls.includes(control.dataset.control);
  }
  $("#input").value = state.text;
  for (const button of document.querySelectorAll("button[data-text]")) {
    button.setAttribute("aria-pressed", button.dataset.text === state.text);
  }
  $("#answer").textContent = waiting ? "" : `You guessed ${state.guess}: it's ${counts.chars} characters in ${counts.units} boxes.`;
  $("#slice").textContent = `.slice(0, 3) gives ${state.text.slice(0, 3)}`;

  $("#view").hidden = waiting;
  renderFigure(groups);
  $("#alt").textContent = describe(counts);
}

// A small helper: an element with a class and some text.
function el(tag, className, text = "") {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

const hex = (n) => n.toString(16).toUpperCase().padStart(4, "0");

// One column per thing you see. Inside it, one box per character,
// and inside that, the 16-bit boxes that .length counts.
function renderFigure(groups) {
  const figure = $("#figure");
  figure.replaceChildren();
  for (const group of groups) {
    const seen = el("div", "seen");
    const chars = el("div", "chars");
    for (const char of group.chars) {
      const box = el("div", char.units.length === 2 ? "char pair" : "char");
      const units = el("div", "units");
      for (const unit of char.units) units.append(el("span", "unit", hex(unit)));
      box.append(el("span", "name", NAMES[char.code] ?? char.char), el("span", "code", `U+${hex(char.code)}`), units);
      chars.append(box);
    }
    seen.append(el("span", "glyph", group.text), chars);
    figure.append(seen);
  }
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// The same state in words, for screen readers and for readers who never touch anything.
function describe({ seen, chars, units }) {
  return `You see ${plural(seen, "symbol", "symbols")}. JavaScript stores ${plural(chars, "character", "characters")} in ${plural(units, "box", "boxes")}, so .length is ${units}.`;
}

$("#input").addEventListener("input", (event) => {
  state.text = event.target.value;
  render();
});
for (const button of document.querySelectorAll("button[data-text]")) {
  button.addEventListener("click", () => {
    state.text = button.dataset.text;
    render();
  });
}
for (const button of document.querySelectorAll("button[data-guess]")) {
  button.addEventListener("click", () => {
    state.guess = Number(button.dataset.guess);
    render();
  });
}
$("#back").addEventListener("click", () => goTo(step - 1));
$("#next").addEventListener("click", () => goTo(step + 1));
$("#reset").addEventListener("click", () => goTo(step));

goTo(0);
