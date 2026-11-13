import { useEffect, useRef, useState } from "react";
import {
  clamp,
  getBoundedOffset,
  getContainedImageSize,
} from "./imageGeometry.js";
import { getSwipeDirection } from "./swipe.js";

const minZoom = 1;
const maxZoom = 3;
const initialTransform = { zoom: minZoom, offsetX: 0, offsetY: 0 };

function getTouchDistance(touches) {
  const firstTouch = touches[0];
  const secondTouch = touches[1];
  const deltaX = secondTouch.clientX - firstTouch.clientX;
  const deltaY = secondTouch.clientY - firstTouch.clientY;

  return Math.hypot(deltaX, deltaY);
}

function getTransformStyle({ zoom, offsetX, offsetY }) {
  return `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${zoom})`;
}

export function useImageGestures({ src, onSwipe }) {
  const stageRef = useRef(null);
  const transformRef = useRef(null);

  const gestureStart = useRef(null);
  const pinchStart = useRef(null);

  const animationFrameRef = useRef(null);

  const liveTransform = useRef({ ...initialTransform });

  const [zoomState, setZoomState] = useState({
    src: null,
    ...initialTransform,
  });

  const imageState =
    zoomState.src === src
      ? zoomState
      : {
          src: src ?? null,
          ...initialTransform,
        };

  useEffect(() => {
    gestureStart.current = null;
    pinchStart.current = null;

    liveTransform.current = { ...initialTransform };

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const element = transformRef.current;

    if (element) {
      element.style.transform = getTransformStyle(liveTransform.current);
    }
  }, [src]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  function applyTransform() {
    const element = transformRef.current;

    if (!element) {
      return;
    }

    element.style.transform = getTransformStyle(liveTransform.current);
  }

  /*
   * Apply at most one transform update per animation frame.
   */
  function scheduleTransform() {
    if (animationFrameRef.current !== null) {
      return;
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      applyTransform();
    });
  }

  function updateTransform(zoom, offsetX, offsetY, metrics) {
    liveTransform.current = {
      zoom,
      ...getBoundedOffset(
        offsetX,
        offsetY,
        zoom,
        metrics.stageWidth,
        metrics.stageHeight,
        metrics.containedWidth,
        metrics.containedHeight,
      ),
    };
    scheduleTransform();
  }

  // Commit live values to React state when the gesture ends.
  function commitTransform() {
    setZoomState({
      src: src ?? null,
      ...liveTransform.current,
    });
  }

  function getStageImageMetrics() {
    const stageRect = stageRef.current?.getBoundingClientRect();
    const renderedImage = stageRef.current?.querySelector(
      'img:not([aria-hidden="true"])',
    );

    if (
      !stageRect ||
      !renderedImage?.naturalWidth ||
      !renderedImage?.naturalHeight
    ) {
      return null;
    }

    return {
      stageWidth: stageRect.width,
      stageHeight: stageRect.height,
      ...getContainedImageSize(
        {
          width: renderedImage.clientWidth,
          height: renderedImage.clientHeight,
        },
        renderedImage,
      ),
    };
  }

  function createGestureStart(touch, metrics) {
    return {
      x: touch.clientX,
      y: touch.clientY,
      offsetX: liveTransform.current.offsetX,
      offsetY: liveTransform.current.offsetY,
      isZoomed: liveTransform.current.zoom > minZoom,
      ...metrics,
    };
  }

  function createPinchStart(touches, metrics) {
    return {
      distance: getTouchDistance(touches),
      zoom: liveTransform.current.zoom,
      offsetX: liveTransform.current.offsetX,
      offsetY: liveTransform.current.offsetY,
      ...metrics,
    };
  }

  function handleTouchStart(event) {
    const metrics = getStageImageMetrics();

    if (!metrics) {
      return;
    }

    if (event.touches.length >= 2) {
      pinchStart.current = createPinchStart(event.touches, metrics);
      gestureStart.current = null;

      return;
    }

    if (event.touches.length !== 1) {
      gestureStart.current = null;
      return;
    }

    const touch = event.touches[0];

    gestureStart.current = createGestureStart(touch, metrics);
  }

  function handleTouchMove(event) {
    if (pinchStart.current && event.touches.length >= 2) {
      event.preventDefault();

      const start = pinchStart.current;

      const nextZoom = clamp(
        start.zoom * (getTouchDistance(event.touches) / start.distance),
        minZoom,
        maxZoom,
      );

      updateTransform(nextZoom, start.offsetX, start.offsetY, start);

      return;
    }

    const gesture = gestureStart.current;
    const touch = event.touches[0];

    if (!gesture || !gesture.isZoomed || !touch) {
      return;
    }

    event.preventDefault();

    updateTransform(
      liveTransform.current.zoom,
      gesture.offsetX + touch.clientX - gesture.x,
      gesture.offsetY + touch.clientY - gesture.y,
      gesture,
    );
  }

  function handleTouchEnd(event) {
    if (pinchStart.current && event.touches.length < 2) {
      pinchStart.current = null;

      commitTransform();

      if (event.touches.length === 1) {
        const touch = event.touches[0];

        const metrics = getStageImageMetrics();

        if (metrics) {
          gestureStart.current = createGestureStart(touch, metrics);
        }
      } else {
        gestureStart.current = null;
      }

      return;
    }

    if (event.touches.length > 0) {
      return;
    }

    const gesture = gestureStart.current;
    const touch = event.changedTouches[0];

    if (gesture?.isZoomed) {
      gestureStart.current = null;

      commitTransform();

      return;
    }

    if (!gesture || !touch) {
      gestureStart.current = null;
      return;
    }

    const direction = getSwipeDirection(gesture, touch);
    gestureStart.current = null;

    if (direction) {
      onSwipe(direction);
    }
  }

  function handleTouchCancel() {
    gestureStart.current = null;
    pinchStart.current = null;
    commitTransform();
  }

  return {
    stageRef,
    transformRef,
    transform: getTransformStyle(imageState),
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
  };
}
