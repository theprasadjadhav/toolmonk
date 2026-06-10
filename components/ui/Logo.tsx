/**
 * ToolMonk logo mark — inline SVG, themes via CSS variables.
 *
 * Concept: the "Monk Wrench" — a monk figure whose bald head contains
 * a hex socket, like a box-end wrench. One mark, two readings.
 *
 * Shapes:
 *   1. White circle        → monk's bald head / wrench ring
 *   2. Primary hex cutout  → tonsure marking / hex socket
 *   3. White trapezoid     → flowing robe / wrench shank
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

      {/* Head — circle, sits top-center */}
      <circle cx="24" cy="16" r="12" fill="white" />

      {/* Hex socket / tonsure — primary color punches through the head */}
      <polygon
        points="27.5,14 24,12 20.5,14 20.5,18 24,20 27.5,18"
        fill="var(--color-primary)"
      />

      {/* Robe — trapezoid widening downward, overlaps the circle base so
          the transition from head to body is seamless */}
      <path d="M19 22 L29 22 L32 44 L16 44 Z" fill="white" />
    </svg>
  );
}
