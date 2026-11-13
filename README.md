# Yoybox

Yoybox is a standalone React image lightbox extracted from a portfolio project. It includes
keyboard navigation, swipe gestures, pinch zoom (1×–3×), panning for zoomed images,
a focus trap, blurred placeholders, translations, and CSS variable themes.
No router or i18n provider is required.

The package name is `react-yoybox`. The project has not been published yet.
Licensed under the [MIT License](LICENSE).

## Development

```sh
npm ci
npm run dev
```

Vite prints the local demo URL. The demo uses local SVG images and supports
English/Slovak controls, a dark theme, and an optional `ImageWrapper`.

```sh
npm run check        # lint, formatting, build, tests, types, and demo build
npm pack             # create an installable .tgz archive without publishing
```

Development requires Node.js 20.19+ (or 22.12+). Peer dependencies are React and
React DOM 18 or 19; the current checks run on React 19.
The runtime dependency is `@emotion/css`; React is not bundled with the package.
The package provides ESM and TypeScript declarations. No separate CSS import is
needed.

## Usage

After building and packing the project, install the archive in another project:

```sh
npm install /path/to/react-yoybox-0.1.0.tgz
```

```jsx
import { useState } from "react";
import { Lightbox } from "react-yoybox";

const images = [
  {
    src: "/photo.webp",
    alt: "Mountain landscape",
    placeholderSrc: "/photo-small.webp",
  },
];

export function Gallery() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open gallery</button>
      {isOpen && (
        <Lightbox images={images} isOpen onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
```

Conditional rendering starts a new session each time the lightbox opens. You can
also keep the component mounted and toggle `isOpen`; it will retain the last image
index. `initialImageIndex` is only read on mount. To start at a different index
when reopening, unmount the component or change its React `key`.

## Props

| Prop                | Type                               | Default behavior                                  |
| ------------------- | ---------------------------------- | ------------------------------------------------- |
| `images`            | `{ src, alt?, placeholderSrc? }[]` | An empty gallery renders nothing                  |
| `isOpen`            | `boolean`                          | Controls whether the lightbox is open             |
| `onClose`           | `() => void`                       | Required callback; the parent closes the lightbox |
| `initialImageIndex` | `number`                           | `0`; out-of-range values are clamped              |
| `title`             | `string`                           | Accessible name; otherwise the image description  |
| `t`                 | `(key) => string`                  | English controls                                  |
| `ImageWrapper`      | React component with `children`    | No custom frame                                   |
| `theme`             | Object containing CSS variables    | Default light theme                               |
| `className`         | `string`                           | Class applied to the portal root                  |

Provide a valid `src` for each image; `alt` is recommended. If `alt` is missing or
empty, a translated fallback description is used. A dedicated error view for
failed image requests is not currently implemented.

The component returns `null` on the server and renders a portal into
`document.body` in the browser. In React Server Components environments, use it
inside a client component. Multiple lightboxes open at the same time are not
supported.

## Translations

The `t` function receives these stable keys:

| Key                               | Default text                |
| --------------------------------- | --------------------------- |
| `yoybox.close`                    | Close                       |
| `yoybox.screenshotPreview`        | Image preview               |
| `yoybox.previousImage`            | Previous image              |
| `yoybox.nextImage`                | Next image                  |
| `yoybox.imageDescriptionNotFound` | Image description not found |

For example, customize the English labels as follows, or replace the values with
translations for your application's language:

```jsx
const translations = {
  "yoybox.close": "Close gallery",
  "yoybox.screenshotPreview": "Photo preview",
  "yoybox.previousImage": "Previous photo",
  "yoybox.nextImage": "Next photo",
  "yoybox.imageDescriptionNotFound": "No photo description available",
};
const t = (key) => translations[key] ?? key;

<Lightbox images={images} isOpen={isOpen} onClose={onClose} t={t} />;
```

You can also pass an existing function from your i18n system. When you provide
`t`, your application is responsible for its output and fallback behavior. The
component does not translate `images[].alt` or `title`; provide them in the chosen
language.

## ImageWrapper

```jsx
function PhotoFrame({ children }) {
  return (
    <div
      style={{
        display: "grid",
        minWidth: 0,
        minHeight: 0,
        padding: 12,
        background: "white",
        borderRadius: 8,
      }}
    >
      {children}
    </div>
  );
}

<Lightbox
  images={images}
  isOpen={isOpen}
  onClose={onClose}
  ImageWrapper={PhotoFrame}
/>;
```

The wrapper receives the image through `children`; the lightbox manages the
controls and caption. The frame must allow the image to shrink to fit the
available space. When `placeholderSrc` is provided, the wrapper also renders
around the placeholder; avoid adding interactive elements or duplicate IDs to it.

## Theming

```jsx
import { Lightbox, defaultLightboxTheme } from "react-yoybox";

<Lightbox
  images={images}
  isOpen={isOpen}
  onClose={onClose}
  theme={{
    "--lightbox-background": "#17191f",
    "--lightbox-text-color": "#f5f6f8",
    "--lightbox-overlay": "rgb(15 17 22 / 96%)",
    "--lightbox-caption-background": "#242832",
  }}
/>;
```

`theme` overrides the supplied CSS variables on the portal root. The complete
defaults are available in the `defaultLightboxTheme` export and in
[src/theme.js](src/theme.js). They cover colors, spacing, button and icon sizes,
border radius, focus outlines, transitions, and z-index.
The `--blur-loaded-image-blur` and `--blur-loaded-image-transition` variables
control the placeholder. A custom `ImageWrapper` manages its own styles.

## Validation

Tests cover navigation, gallery boundaries, translation keys, closing with the
button, Escape key, and backdrop click, focus management, scroll locking,
wrappers, themes, SSR, and touch gesture geometry. Interaction tests use JSDOM;
verify actual layout, image loading, and multi-touch gestures on devices as well.
