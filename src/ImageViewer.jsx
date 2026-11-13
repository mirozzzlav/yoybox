import { css } from "@emotion/css";
import { useImageGestures } from "./useImageGestures.js";
import { BlurLoadedImage } from "./BlurLoadedImage.jsx";

const styles = {
  stage: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gridTemplateRows: "minmax(0, 1fr)",
    minWidth: 0,
    minHeight: 0,
    width: "100%",
    height: "100%",
    touchAction: "none",
    overscrollBehavior: "none",
    userSelect: "none",
    WebkitUserSelect: "none",
  },

  image: {
    height: "100%",
    border: 0,
    backgroundColor: "transparent",

    img: {
      pointerEvents: "none",
      userSelect: "none",
      objectFit: "contain",
    },
  },

  transformLayer: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gridTemplateRows: "minmax(0, 1fr)",
    width: "100%",
    height: "100%",
    minWidth: 0,
    minHeight: 0,
    transformOrigin: "center center",
    willChange: "transform",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  },
};

export function ImageViewer({
  image,
  imageDescription,
  onSwipe,
  ImageWrapper,
}) {
  const { stageRef, transformRef, transform, touchHandlers } = useImageGestures(
    {
      src: image.src,
      onSwipe,
    },
  );

  return (
    <div ref={stageRef} className={css(styles.stage)} {...touchHandlers}>
      <div
        ref={transformRef}
        className={css(styles.transformLayer)}
        style={{ transform }}
      >
        <BlurLoadedImage
          className={css(styles.image)}
          src={image.src}
          placeholderSrc={image.placeholderSrc}
          alt={imageDescription}
          ImageWrapper={ImageWrapper}
        />
      </div>
    </div>
  );
}
