# Changelog

## 0.2.0

### Breaking changes

- Rename the `images` prop to `media` for both `Yoybox` and `Lightbox`.
- Replace the TypeScript `LightboxImage` interface with `LightboxMedia`.

### Added

- Export `Yoybox` and `YoyboxProps`; keep `Lightbox` as a component alias and
  retain `LightboxProps`.
- Support mixed image and YouTube galleries, detecting watch, short link, embed,
  Shorts, and live URLs. Only the active player is mounted, using
  `youtube-nocookie.com`.
- Support media titles and `showCaption` to hide visible captions while keeping
  accessible descriptions.

### Changed

- Include iframes in the focus trap's tab stops.
- Ignore handled or modified keyboard events and avoid gallery arrow shortcuts
  in editable fields and media elements. Keys inside YouTube players are handled
  by the player.
- Show an icon-only close button at the mobile breakpoint while preserving its
  accessible label.
