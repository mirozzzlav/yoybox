const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/;
const youtubeHosts = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

export function getYouTubeVideoId(src) {
  let url;
  try {
    url = new URL(src);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  let id;
  if (url.hostname === "youtu.be") {
    id = url.pathname.slice(1);
  } else if (youtubeHosts.has(url.hostname)) {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else {
      id = /^\/(?:embed|shorts|live)\/([^/]+)\/?$/.exec(url.pathname)?.[1];
    }
  }
  return typeof id === "string" && videoIdPattern.test(id) ? id : null;
}
