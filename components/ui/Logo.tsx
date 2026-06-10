/**
 * ToolMonk logo mark — inline SVG, themes via CSS variables.
 *
 * Icon: a capital "T" whose crossbar ends have open-wrench jaw cutouts.
 * Reads as "T" at a glance; reads as a wrench on closer inspection.
 */

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 25, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {/* Badge */}
      <rect width="48" height="48" rx="10" fill="var(--color-primary)" />
      {/*
        T-Wrench mark (white).
        Crossbar runs full-width; the two bottom-outer corners are notched
        (jaw openings of an open-end wrench). The vertical stem sits centered.
      */}
      <path
        d="M5 7 L43 7 L43 11 L35 11 L35 15 L29 15 L29 41 L19 41 L19 15 L13 15 L13 11 L5 11 Z"
        fill="white"
      />
    </svg>
  );
}
