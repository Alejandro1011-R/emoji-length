# Why is "👍🏽".length 4?

An explorable explanation for the Programming Interactivity final project (topic 12, text encoding).

JavaScript keeps text in boxes of 16 bits, and `.length` counts those boxes, not the symbols you see. Characters with a number above 0xFFFF don't fit in one box, so they are split into two. Many emoji are also several characters glued together: a thumbs-up plus a skin tone, or four people joined by an invisible zero-width joiner. The page walks through that in six steps, adding controls as the story needs them, and ends with a text box where you can try anything.

To run it, serve the folder over http, because module scripts don't load from `file://`:

```sh
npx live-server --port=8080
```

The idea lives in `model.js`, which has no DOM so it also runs in Node. `steps.js` holds the story as data, and `main.js` keeps one state, draws the page from it and wires the controls. Every number the text states is checked by `claims.test.mjs`, which you run with `node --test claims.test.mjs`.
