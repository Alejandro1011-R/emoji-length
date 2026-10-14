// One state. A render function that reads it. Inputs and scrolling change it.
import { analyze, count } from "./model.js";

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

const sections = [...document.querySelectorAll(".step")];
let step = -1;
const state = { text: "" };

const $ = (selector) => document.querySelector(selector);

// Reaching a section starts the figure from that section's text.
function goTo(n) {
  if (n === step) return;
  step = n;
  state.text = sections[n].dataset.start;
  for (const section of sections) section.classList.toggle("active", section === sections[n]);
  render(true);
}

function render(animate) {
  const groups = analyze(state.text);
  const waiting = step === 0 && state.guess === undefined;

  $("#input").value = state.text;
  for (const button of document.querySelectorAll("button[data-text]")) {
    button.setAttribute("aria-pressed", button.dataset.text === state.text);
  }
  $("#answer").textContent = state.guess === undefined ? "" : `You guessed ${state.guess}.`;
  $("#slice").textContent = `"${state.text}".slice(0, 3) is ${state.text.slice(0, 3)}`;

  $("#view").style.visibility = waiting ? "hidden" : ""; // keeps its space, so nothing jumps when it appears
  renderFigure(groups, animate);
  $("#alt").textContent = describe(count(groups));
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
// With animate, the boxes come out one after another (--i is their order).
function renderFigure(groups, animate) {
  const figure = $("#figure");
  figure.classList.toggle("animate", animate);
  figure.replaceChildren();
  let i = 0;
  for (const group of groups) {
    const seen = el("div", "seen");
    const chars = el("div", "chars");
    for (const char of group.chars) {
      const box = el("div", char.units.length === 2 ? "char pair" : "char");
      const units = el("div", "units");
      for (const unit of char.units) {
        const span = el("span", "unit", hex(unit));
        span.style.setProperty("--i", i++);
        units.append(span);
      }
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

// Typing redraws without animation, so the boxes don't replay on every key.
$("#input").addEventListener("input", (event) => {
  state.text = event.target.value;
  render(false);
});
for (const button of document.querySelectorAll("button[data-text]")) {
  button.addEventListener("click", () => {
    state.text = button.dataset.text;
    render(true);
  });
}
for (const button of document.querySelectorAll("button[data-guess]")) {
  button.addEventListener("click", () => {
    state.guess = Number(button.dataset.guess);
    render(true);
  });
}

// The section crossing the middle of the screen is the one being read.
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) goTo(sections.indexOf(entry.target));
  }
}, { rootMargin: "-50% 0px -50% 0px" });
for (const section of sections) observer.observe(section);

goTo(0);
