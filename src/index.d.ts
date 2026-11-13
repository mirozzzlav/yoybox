import type {
  ComponentType,
  CSSProperties,
  ReactElement,
  ReactNode,
} from "react";

export interface LightboxImage {
  src: string;
  alt?: string;
  placeholderSrc?: string;
}

export type LightboxTranslationKey =
  | "yoybox.close"
  | "yoybox.screenshotPreview"
  | "yoybox.previousImage"
  | "yoybox.nextImage"
  | "yoybox.imageDescriptionNotFound";

export type LightboxTheme = CSSProperties & {
  [variable: `--lightbox-${string}`]: string | number | undefined;
  [variable: `--blur-loaded-image-${string}`]: string | number | undefined;
};

export interface LightboxProps {
  images: readonly LightboxImage[];
  isOpen: boolean;
  onClose: () => void;
  /** Used on mount. Remount the lightbox to start a new gallery session. */
  initialImageIndex?: number;
  title?: string;
  className?: string;
  t?: (key: LightboxTranslationKey) => string;
  /** Receives an image as children; must allow it to shrink within the viewer. */
  ImageWrapper?: ComponentType<{ children: ReactNode }>;
  theme?: LightboxTheme;
}

export declare function Lightbox(props: LightboxProps): ReactElement | null;
export declare const defaultLightboxTheme: Readonly<LightboxTheme>;
