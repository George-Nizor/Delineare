// Small line icons for the navigation, drawn at 24 units with the current text colour.
const PATHS = {
  home: <path d="M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z" />,
  course: <path d="M4 5 H10 Q12 5 12 7 V20 Q12 18 10 18 H4 Z M20 5 H14 Q12 5 12 7 V20 Q12 18 14 18 H20 Z" />,
  practice: <><circle cx="12" cy="13" r="7" /><path d="M12 13 L12 9 M10 3 H14" /></>,
  library: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 9 L15 12 L10 15 Z" /></>,
  sketchbook: <><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M5 7 H3 M5 12 H3 M5 17 H3 M9 14 L15 8" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5 Q9.5 7 12 7 Q14.5 7 14.5 9.3 Q14.5 11 12 12 V13.5 M12 16.5 V17" /></>,
  settings: <><path d="M4 7 H14 M18 7 H20 M4 17 H8 M12 17 H20" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20 L16.5 16.5" /></>,
  play: <path d="M8 5 L19 12 L8 19 Z" />,
  back: <path d="M15 5 L8 12 L15 19" />,
  next: <path d="M9 5 L16 12 L9 19" />,
  open: <path d="M14 4 H20 V10 M20 4 L11 13 M18 14 V20 H4 V6 H10" />,
  check: <path d="M5 12.5 L10 17 L19 7" />,
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg className={`icon icon-${name}`} aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name]}
    </svg>
  );
}
