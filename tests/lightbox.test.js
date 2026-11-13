import assert from "node:assert/strict";
import { after, afterEach, beforeEach, test } from "node:test";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost",
  pretendToBeVisual: true,
});
for (const key of ["window", "document", "HTMLElement", "Node", "navigator"]) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: dom.window[key],
  });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(
  dom.window,
);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(
  dom.window,
);
// JSDOM has no layout. Unit tests cover filtering of hidden controls separately.
dom.window.HTMLElement.prototype.getClientRects = function () {
  return [this.getBoundingClientRect()];
};

const { act, createElement: h, StrictMode } = await import("react");
const { createRoot } = await import("react-dom/client");
const { Lightbox } = await import("../dist/index.js");
const images = [
  { src: "/first.jpg", alt: "First photograph" },
  { src: "/second.jpg", alt: "Second photograph" },
];
let root;
let opener;
let closeCount;

async function render(props = {}) {
  await act(async () => {
    root.render(
      h(
        StrictMode,
        null,
        h(Lightbox, {
          images,
          isOpen: true,
          onClose: () => {
            closeCount += 1;
          },
          ...props,
        }),
      ),
    );
  });
}
const button = (label) =>
  document.querySelector(`button[aria-label="${label}"]`);
async function key(key, shiftKey = false) {
  await act(async () => {
    document.dispatchEvent(
      new dom.window.KeyboardEvent("keydown", {
        key,
        shiftKey,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
}
async function click(element) {
  await act(async () => {
    element.click();
  });
}

beforeEach(() => {
  document.body.innerHTML =
    '<button id="opener">Open gallery</button><div id="root"></div>';
  opener = document.getElementById("opener");
  opener.focus();
  document.body.style.overflow = "auto";
  closeCount = 0;
  root = createRoot(document.getElementById("root"));
});
afterEach(async () => {
  await act(async () => root.unmount());
});
after(() => dom.window.close());

test("opening focuses controls, traps Tab, and closing restores focus and scrolling", async () => {
  await render();
  assert.ok(document.querySelector('[role="dialog"][aria-modal="true"]'));
  assert.equal(document.body.style.overflow, "hidden");
  assert.equal(document.activeElement, button("Close"));
  await key("Tab");
  assert.equal(document.activeElement, button("Next image"));
  await key("Tab");
  assert.equal(document.activeElement, button("Close"));
  await key("Tab", true);
  assert.equal(document.activeElement, button("Next image"));
  await key("Escape");
  assert.equal(closeCount, 1);
  await render({ isOpen: false });
  assert.equal(document.querySelector('[role="dialog"]'), null);
  assert.equal(document.activeElement, opener);
  assert.equal(document.body.style.overflow, "auto");
});

test("buttons and keyboard navigate within gallery bounds", async () => {
  await render();
  assert.equal(button("Previous image").disabled, true);
  await click(button("Next image"));
  assert.equal(
    document.querySelector("img").getAttribute("src"),
    "/second.jpg",
  );
  assert.equal(button("Next image").disabled, true);
  await key("ArrowRight");
  assert.equal(
    document.querySelector("img").getAttribute("src"),
    "/second.jpg",
  );
  await key("ArrowLeft");
  assert.equal(document.querySelector("img").getAttribute("src"), "/first.jpg");
});

test("close button and backdrop call onClose", async () => {
  await render();
  await click(button("Close"));
  await click(document.querySelector('[role="dialog"] > [aria-hidden="true"]'));
  assert.equal(closeCount, 2);
});

test("translations use stable keys and update while open", async () => {
  const t = (key) => `SK:${key}`;
  await render({ t, images: [{ src: "/first.jpg" }] });
  assert.ok(button("SK:yoybox.close"));
  assert.equal(
    document.querySelector("img").alt,
    "SK:yoybox.imageDescriptionNotFound",
  );
  await render({ t: undefined });
  assert.ok(button("Close"));
});

test("initial index, theme, and ImageWrapper are passed through", async () => {
  function Frame({ children }) {
    return h("div", { "data-frame": true }, children);
  }
  await render({
    initialImageIndex: 1,
    title: "Gallery",
    ImageWrapper: Frame,
    theme: { "--lightbox-text-color": "red" },
  });
  const dialog = document.querySelector('[role="dialog"]');
  assert.equal(dialog.getAttribute("aria-label"), "Image preview: Gallery");
  assert.equal(dialog.style.getPropertyValue("--lightbox-text-color"), "red");
  assert.equal(
    document.querySelector("[data-frame] img").alt,
    "Second photograph",
  );
});

test("an empty gallery renders nothing and leaves focus and scroll alone", async () => {
  await render({ images: [] });
  assert.equal(document.querySelector('[role="dialog"]'), null);
  assert.equal(document.activeElement, opener);
  assert.equal(document.body.style.overflow, "auto");
});
