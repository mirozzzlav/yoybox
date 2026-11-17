import assert from "node:assert/strict";
import test from "node:test";
import { getYouTubeVideoId } from "../src/media.js";

const id = "O6yMMybqBCQ";

test("detects supported YouTube URLs without a type or video ID prop", () => {
  for (const src of [
    `https://www.youtube.com/watch?v=${id}&t=10`,
    `https://youtube.com/watch?feature=share&v=${id}`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}?si=share`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube-nocookie.com/embed/${id}`,
    `https://youtube.com/shorts/${id}?feature=share`,
    `https://youtube.com/live/${id}/`,
  ]) {
    assert.equal(getYouTubeVideoId(src), id, src);
  }
});

test("images, malformed URLs, invalid IDs and lookalike hosts are not players", () => {
  for (const src of [
    undefined,
    "",
    "/photo.webp",
    "photos/portrait.jpg",
    "data:image/png;base64,AA==",
    "https://example.com/photo.jpg",
    `https://youtube.com.evil.example/watch?v=${id}`,
    `https://youtube.com@evil.example/watch?v=${id}`,
    `ftp://youtube.com/watch?v=${id}`,
    "https://youtube.com/watch?v=invalid",
    "https://youtube.com/embed/../../invalid?autoplay=1",
    `https://youtu.be/${id}/extra`,
    `https://youtube.com/not-supported/${id}`,
  ]) {
    assert.equal(getYouTubeVideoId(src), null, String(src));
  }
});
