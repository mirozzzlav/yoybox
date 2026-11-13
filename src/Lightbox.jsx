import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "./useFocusTrap.js";
import { css, cx } from "@emotion/css";
import { mobileQuery } from "./mediaQueries.js";
import { Backdrop } from "./Backdrop.jsx";
import { ImageViewer } from "./ImageViewer.jsx";
import { ArrowButton } from "./ArrowButton.jsx";
import { CloseButton } from "./CloseButton.jsx";
import { Description } from "./Description.jsx";
import { defaultLightboxTheme } from "./theme.js";
import { clamp } from "./imageGeometry.js";

const styles = {
  root: {
    ...defaultLightboxTheme,
    boxSizing: "border-box",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: "var(--lightbox-font-size)",
    fontWeight: 400,
    fontStyle: "normal",
    lineHeight: 1.5,
    color: "var(--lightbox-text-color)",

    "& *, & *::before, & *::after": {
      boxSizing: "border-box",
    },

    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: "var(--lightbox-z-index)",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gridTemplateRows: "minmax(0, 1fr)",
    placeItems: "center",
    padding:
      "max(var(--lightbox-spacing), env(safe-area-inset-top)) max(calc(var(--lightbox-spacing) * 2), env(safe-area-inset-right)) max(var(--lightbox-spacing), env(safe-area-inset-bottom)) max(calc(var(--lightbox-spacing) * 2), env(safe-area-inset-left))",
    width: "100%",
    height: "100vh",
    minHeight: "100vh",
    overflow: "hidden",

    [`@media ${mobileQuery}`]: {
      paddingInline:
        "max(calc(var(--lightbox-spacing) * 4 / 3), env(safe-area-inset-left)) max(calc(var(--lightbox-spacing) * 4 / 3), env(safe-area-inset-right))",
    },

    "@supports (height: 100dvh)": {
      height: "100dvh",
      minHeight: "100dvh",
    },
  },

  panel: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateRows: "auto minmax(0, 1fr) auto",
    gap: "var(--lightbox-spacing)",
    width: "100%",
    height: "100%",
    minWidth: 0,
    minHeight: 0,
  },

  header: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "var(--lightbox-spacing)",
  },

  image: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gridTemplateRows: "minmax(0, 1fr)",
    minWidth: 0,
    minHeight: 0,
    overflow: "hidden",
  },

  footer: {
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    alignItems: "center",
    gap: "var(--lightbox-spacing)",
  },

  caption: {
    minWidth: 0,
    maxHeight: "20dvh",
    overflowY: "auto",
  },
};

const defaultTranslations = {
  "ui.close": "Close",
  "ui.screenshotPreview": "Image preview",
  "ui.previousImage": "Previous image",
  "ui.nextImage": "Next image",
  "ui.imageDescriptionNotFound": "Image description not found",
};

const defaultT = (key) => defaultTranslations[key] ?? key;

// ImageWrapper receives only an <img> as children. The lightbox owns the
// viewer, gestures, controls, and gallery metadata.
// t receives translation keys; English defaults allow standalone use.
export function Lightbox({
  className,
  images = [],
  initialImageIndex = 0,
  isOpen,
  onClose,
  title,
  ImageWrapper,
  t = defaultT,
  theme,
}) {
  const [imageIndex, setImageIndex] = useState(initialImageIndex);
  const lastIndex = Math.max(images.length - 1, 0);
  const activeIndex = clamp(imageIndex, 0, lastIndex);
  const image = images[activeIndex];
  const isActive = isOpen && Boolean(image);
  const imageDescription =
    image?.alt?.trim() || t("ui.imageDescriptionNotFound");
  const canNavigatePrevious = activeIndex > 0;
  const canNavigateNext = activeIndex < images.length - 1;
  const panelRef = useFocusTrap(isActive);

  const navigate = useCallback(
    (direction) => {
      setImageIndex((currentIndex) => {
        const boundedIndex = clamp(currentIndex, 0, lastIndex);
        return clamp(boundedIndex + direction, 0, lastIndex);
      });
    },
    [lastIndex],
  );

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        navigate(event.key === "ArrowLeft" ? -1 : 1);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isActive, onClose, navigate]);

  if (!isActive || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={panelRef}
      className={cx(css(styles.root), className)}
      style={theme}
      role="dialog"
      tabIndex={-1}
      aria-modal="true"
      aria-label={`${t("ui.screenshotPreview")}: ${title || imageDescription}`}
    >
      <Backdrop onClick={onClose} />
      <div className={css(styles.panel)}>
        <div className={css(styles.header)}>
          <CloseButton label={t("ui.close")} onClick={onClose} />
        </div>
        <div className={css(styles.image)}>
          <ImageViewer
            image={image}
            imageDescription={imageDescription}
            onSwipe={navigate}
            ImageWrapper={ImageWrapper}
          />
        </div>
        <div className={css(styles.footer)}>
          <ArrowButton
            direction="previous"
            aria-label={t("ui.previousImage")}
            disabled={!canNavigatePrevious}
            onClick={() => navigate(-1)}
          />
          <div className={css(styles.caption)} aria-live="polite">
            <Description>{imageDescription}</Description>
          </div>
          <ArrowButton
            direction="next"
            aria-label={t("ui.nextImage")}
            disabled={!canNavigateNext}
            onClick={() => navigate(1)}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
