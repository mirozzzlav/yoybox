import { css, cx } from "@emotion/css";
import { mobileQuery } from "./mediaQueries.js";
import { LightboxButton } from "./LightboxButton.jsx";

const closeButtonStyle = css({
  [`@media ${mobileQuery}`]: {
    width: "var(--lightbox-button-size)",
    height: "var(--lightbox-button-size)",
    padding: 0,
    gap: 0,
    "& > span": {
      display: "none",
    },
  },
});

export function CloseButton({ className, label = "Close", ...props }) {
  return (
    <LightboxButton
      className={cx(closeButtonStyle, className)}
      aria-label={label}
      {...props}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M6 6l12 12M18 6 6 18"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      <span>{label}</span>
    </LightboxButton>
  );
}
