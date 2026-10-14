# Why is "👍🏽".length 4?

An explorable explanation for the Programming Interactivity final project (topic 12, text encoding).

JavaScript keeps text in boxes of 16 bits, and `.length` counts those boxes, not the symbols you see. Characters with a number above 0xFFFF don't fit in one box, so they are split into two. Many emoji are also several characters glued together: a thumbs-up plus a skin tone, or four people joined by an invisible zero-width joiner. The page is one scrolling story in four sections: the text scrolls on the left while the figure stays in view, and the last section ends with a text box where you can try anything.

To run it, serve the folder over http, because module scripts don't load from `file://`:

```sh
npx live-server --port=8080
```

The idea lives in `model.js`, which has no DOM so it also runs in Node. The story is in `index.html`, one section per step, and `main.js` keeps one state, draws the figure from it, wires the buttons and watches which section is being read. Every number the text states is checked by `claims.test.mjs`, which you run with `node --test claims.test.mjs`.
