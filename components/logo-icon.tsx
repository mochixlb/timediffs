/**
 * Logo icon component for timediffs.app
 * 
 * Represents timezone comparison with two parallel timelines
 * showing time markers at different positions, symbolizing how
 * the same moment appears at different times across timezones.
 * Refined, elegant design with perfect proportions and visual balance.
 */
export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Top timeline */}
      <line
        x1="2"
        y1="8"
        x2="22"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Top timeline marker - earlier position */}
      <circle cx="7" cy="8" r="2.25" fill="currentColor" />
      
      {/* Bottom timeline */}
      <line
        x1="2"
        y1="16"
        x2="22"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Bottom timeline marker - later position (showing time difference) */}
      <circle cx="17" cy="16" r="2.25" fill="currentColor" />
      
      {/* Subtle connecting line showing the relationship/difference */}
      <line
        x1="7"
        y1="8"
        x2="17"
        y2="16"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 1.5"
        opacity="0.2"
      />
    </svg>
  );
}
