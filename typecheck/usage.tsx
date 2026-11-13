import { Lightbox, defaultLightboxTheme } from "react-yoybox";
import type { LightboxImage, LightboxTheme } from "react-yoybox";
import type { ReactNode } from "react";

const images: readonly LightboxImage[] = [{ src: "/photo.jpg", alt: "Photo" }];
const theme: LightboxTheme = {
  ...defaultLightboxTheme,
  "--lightbox-text-color": "red",
  "--blur-loaded-image-blur": "8px",
};
function Frame({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
export const example = (
  <Lightbox
    images={images}
    isOpen
    onClose={() => {}}
    t={(key) => key}
    ImageWrapper={Frame}
    theme={theme}
  />
);

// @ts-expect-error onClose is required
export const missingCallback = <Lightbox images={images} isOpen />;
// @ts-expect-error each image needs a source
export const missingSource: LightboxImage = { alt: "Photo" };
