import { Yoybox, Lightbox, defaultLightboxTheme } from "react-yoybox";
import type { LightboxMedia, LightboxTheme } from "react-yoybox";
import type { ReactNode } from "react";

const media: readonly LightboxMedia[] = [{ src: "/photo.jpg", alt: "Photo" }];
const theme: LightboxTheme = {
  ...defaultLightboxTheme,
  "--lightbox-text-color": "red",
  "--blur-loaded-image-blur": "8px",
};
function Frame({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
export const example = (
  <Yoybox
    media={media}
    isOpen
    onClose={() => {}}
    t={(key) => key}
    ImageWrapper={Frame}
    theme={theme}
  />
);

// @ts-expect-error onClose is required
export const missingCallback = <Yoybox media={media} isOpen />;
// @ts-expect-error each image needs a source
export const missingSource: LightboxMedia = { alt: "Photo" };

export const mixedGallery = (
  <Yoybox
    showCaption={false}
    media={[
      { src: "/photo.jpg", alt: "Photo" },
      { src: "https://youtu.be/O6yMMybqBCQ", title: "Training" },
    ]}
    isOpen
    onClose={() => {}}
  />
);

export const legacyExample = (
  <Lightbox media={media} isOpen onClose={() => {}} />
);

export const removedImages = (
  // @ts-expect-error the images prop was replaced by media
  <Yoybox images={media} isOpen onClose={() => {}} />
);
// @ts-expect-error media items always need a source URL
export const missingMediaSource: LightboxMedia = { title: "Training" };
