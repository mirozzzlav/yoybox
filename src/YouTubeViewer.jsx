import { css } from "@emotion/css";

const stage = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  minWidth: 0,
  minHeight: 0,
  containerType: "size",
  iframe: {
    width: "min(100cqw, calc(100cqh * 16 / 9))",
    height: "auto",
    aspectRatio: "16 / 9",
    border: 0,
  },
});

export function YouTubeViewer({ videoId, title }) {
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return null;
  }

  return (
    <div className={stage}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
