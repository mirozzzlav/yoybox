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
const { Yoybox, Lightbox } = await import("../dist/index.js");
const media = [
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
        h(Yoybox, {
          media,
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
  await render({ t, media: [{ src: "/first.jpg" }] });
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
  await render({ media: [] });
  assert.equal(document.querySelector('[role="dialog"]'), null);
  assert.equal(document.activeElement, opener);
  assert.equal(document.body.style.overflow, "auto");
});

const mixedMedia = [
  media[0],
  {
    src: "https://www.youtube.com/watch?v=O6yMMybqBCQ",
    title: "Aikido demonstration",
  },
  { src: "https://youtu.be/uOFCY5QgEGg", title: "Training" },
  media[1],
];

test("mixed galleries mount only the active player and remove it on navigation and close", async () => {
  await render({ media: mixedMedia });
  assert.equal(document.querySelector("iframe"), null);
  await click(button("Next image"));
  const firstPlayer = document.querySelector("iframe");
  assert.equal(
    firstPlayer.src,
    "https://www.youtube-nocookie.com/embed/O6yMMybqBCQ",
  );
  assert.equal(firstPlayer.title, "Aikido demonstration");
  assert.equal(firstPlayer.allowFullscreen, true);
  assert.equal(document.querySelector("img"), null);
  await click(button("Next image"));
  assert.equal(firstPlayer.isConnected, false);
  const secondPlayer = document.querySelector("iframe");
  assert.equal(
    secondPlayer.src,
    "https://www.youtube-nocookie.com/embed/uOFCY5QgEGg",
  );
  await click(button("Next image"));
  assert.equal(secondPlayer.isConnected, false);
  assert.equal(document.querySelector("iframe"), null);
  assert.equal(
    document.querySelector("img").src,
    "http://localhost/second.jpg",
  );
  await key("ArrowLeft");
  assert.ok(document.querySelector("iframe"));
  await render({ media: mixedMedia, isOpen: false });
  assert.equal(document.querySelector("iframe"), null);
  assert.equal(document.activeElement, opener);
});

test("video player participates in the tab order and image wrappers are not used for videos", async () => {
  function Frame({ children }) {
    return h("div", { "data-frame": true }, children);
  }
  await render({
    media: mixedMedia,
    initialImageIndex: 1,
    ImageWrapper: Frame,
  });
  assert.equal(document.querySelector("[data-frame]"), null);
  await key("Tab");
  assert.equal(document.activeElement, document.querySelector("iframe"));
  await key("Tab", true);
  assert.equal(document.activeElement, button("Close"));
});

test("empty media renders nothing and invalid video URLs never become iframe URLs", async () => {
  await render({ media: [] });
  assert.equal(document.querySelector('[role="dialog"]'), null);
  await render({
    media: [
      {
        src: "https://www.youtube.com/embed/../../invalid?autoplay=1",
        title: "Invalid video",
      },
    ],
  });
  assert.equal(document.querySelector("iframe"), null);
});

test("prevented and modified arrow keys do not navigate a mixed gallery", async () => {
  await render({ media: mixedMedia });
  for (const options of [
    { ctrlKey: true },
    { altKey: true },
    { metaKey: true },
    { prevented: true },
  ]) {
    await act(async () => {
      const event = new dom.window.KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true,
        ...options,
      });
      if (options.prevented) event.preventDefault();
      document.dispatchEvent(event);
    });
    assert.equal(document.querySelector("iframe"), null);
  }
  await key("ArrowRight");
  assert.ok(document.querySelector("iframe"));
});

test("captions remain visible by default and can be hidden without removing accessible descriptions", async () => {
  await render();
  assert.equal(
    document.querySelector('[aria-live="polite"]').textContent,
    "First photograph",
  );
  await render({ showCaption: false });
  assert.equal(document.querySelector('[aria-live="polite"]').textContent, "");
  assert.equal(document.querySelector("img").alt, "First photograph");
  assert.equal(
    document.querySelector('[role="dialog"]').getAttribute("aria-label"),
    "Image preview: First photograph",
  );
});

test("Lightbox remains an alias of the primary Yoybox export", () => {
  assert.equal(Lightbox, Yoybox);
});

test("embed and Shorts sources select a player while external images stay images", async () => {
  for (const src of [
    "https://www.youtube.com/embed/O6yMMybqBCQ",
    "https://youtube.com/shorts/O6yMMybqBCQ",
  ]) {
    await render({ media: [{ src, alt: "Training" }] });
    assert.equal(
      document.querySelector("iframe").src,
      "https://www.youtube-nocookie.com/embed/O6yMMybqBCQ",
    );
    assert.equal(document.querySelector("iframe").title, "Training");
    assert.equal(document.querySelector("img"), null);
  }
  await render({
    media: [{ src: "https://example.com/photo.webp", title: "Portrait" }],
  });
  assert.equal(document.querySelector("iframe"), null);
  assert.equal(document.querySelector("img").alt, "Portrait");
});
