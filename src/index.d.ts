import type {
  ComponentType,
  CSSProperties,
  ReactElement,
  ReactNode,
} from "react";

/** Images and YouTube URLs share the same shape; the viewer detects the source. */
export interface LightboxMedia {
  src: string;
  alt?: string;
  title?: string;
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
  /** Image sources or YouTube watch, short, live, embed, or youtu.be URLs. */
  media?: readonly LightboxMedia[];
  isOpen: boolean;
  onClose: () => void;
  /** Used on mount. Remount the lightbox to start a new gallery session. */
  initialImageIndex?: number;
  title?: string;
  /** Hide the visible caption while retaining accessible media descriptions. */
  showCaption?: boolean;
  className?: string;
  t?: (key: LightboxTranslationKey) => string;
  /** Receives an image as children; must allow it to shrink within the viewer. */
  ImageWrapper?: ComponentType<{ children: ReactNode }>;
  theme?: LightboxTheme;
}

export type YoyboxProps = LightboxProps;
export declare function Yoybox(props: YoyboxProps): ReactElement | null;
/** Backward-compatible alias for Yoybox. */
export { Yoybox as Lightbox };
export declare const defaultLightboxTheme: Readonly<LightboxTheme>;
