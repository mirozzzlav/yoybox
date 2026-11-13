import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Lightbox } from "../src/index.js";
import "./style.css";

const images = [
  { src: "/landscape.svg", alt: "Mountain landscape at sunset" },
  { src: "/portrait.svg", alt: "Abstract portrait composition" },
];
const translations = {
  "ui.close": "Zatvoriť",
  "ui.screenshotPreview": "Náhľad obrázka",
  "ui.previousImage": "Predchádzajúci obrázok",
  "ui.nextImage": "Ďalší obrázok",
  "ui.imageDescriptionNotFound": "Popis obrázka sa nenašiel",
};
const t = (key) => translations[key] ?? key;

export function PhotoFrame({ children }) {
  return <div className="photo-frame">{children}</div>;
}

export function Demo() {
  const [preview, setPreview] = useState(null);
  const [language, setLanguage] = useState("en");
  const [framed, setFramed] = useState(false);
  const [dark, setDark] = useState(false);

  return (
    <main>
      <p className="eyebrow">Standalone React component</p>
      <h1>Lightbox</h1>
      <p>
        Open an image. Browse with the arrow keys or swipe; pinch to zoom on
        mobile. Press Escape to close the preview.
      </p>
      <div className="controls">
        <label>
          Language{" "}
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="sk">Slovak</option>
            <option value="en">English</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={framed}
            onChange={(event) => setFramed(event.target.checked)}
          />{" "}
          Custom ImageWrapper
        </label>
        <label>
          <input
            type="checkbox"
            checked={dark}
            onChange={(event) => setDark(event.target.checked)}
          />{" "}
          Dark theme
        </label>
      </div>
      <div className="gallery">
        {images.map((image, index) => (
          <button
            key={image.src}
            onClick={() => setPreview(index)}
            aria-label={`Open: ${image.alt}`}
          >
            <img src={image.src} alt={image.alt} />
          </button>
        ))}
      </div>
      {preview !== null && (
        <Lightbox
          images={images}
          initialImageIndex={preview}
          isOpen
          onClose={() => setPreview(null)}
          t={language === "sk" ? t : undefined}
          ImageWrapper={framed ? PhotoFrame : undefined}
          theme={
            dark
              ? {
                  "--lightbox-background": "#17191f",
                  "--lightbox-text-color": "#f5f6f8",
                  "--lightbox-overlay": "rgb(15 17 22 / 96%)",
                  "--lightbox-caption-background": "#242832",
                  "--lightbox-border-color": "#566071",
                }
              : undefined
          }
        />
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Demo />
  </StrictMode>,
);
