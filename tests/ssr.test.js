import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { Lightbox, defaultLightboxTheme } from "../dist/index.js";

test("the built package can render on the server without a DOM", () => {
  for (const isOpen of [false, true]) {
    assert.equal(
      renderToString(
        createElement(Lightbox, {
          images: [{ src: "/photo.jpg", alt: "Photograph" }],
          isOpen,
          onClose() {},
        }),
      ),
      "",
    );
  }
  assert.equal(defaultLightboxTheme["--lightbox-background"], "#fff");
});
