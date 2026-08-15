import type { ReactNode } from "react";

export const iconNames = [
  "home", "grid", "restaurant", "store", "pill", "legal", "finance",
  "chart", "settings", "bell", "search", "plus", "arrow-up", "arrow-right",
  "more", "menu", "close", "chevron-down", "users", "calendar", "truck", "paw", "wrench", "bricks", "car"
] as const;

export type IconName = (typeof iconNames)[number];

type IconProps = {
  readonly name: IconName;
  readonly size?: number;
  readonly strokeWidth?: number;
  readonly filled?: boolean;
};

const pathByIcon: Record<IconName, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" /><path d="M9 21v-7h6v7" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  restaurant: <><path d="M6 3v7a3 3 0 0 0 6 0V3M9 3v18M17 3v18M17 3c3 2 3 7 0 9" /></>,
  store: <><path d="M3 10h18l-2-6H5l-2 6Z" /><path d="M5 10v10h14V10M9 20v-5h6v5" /><path d="M3 10a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 5-2" /></>,
  pill: <><path d="m8 4 12 12a4.2 4.2 0 0 1-6 6L2 10a4.2 4.2 0 0 1 6-6Z" /><path d="m6 12 6-6" /></>,
  legal: <><path d="M12 3v18M5 7h14M3 7l3 6a3 3 0 0 0 5 0l3-6M13 7l3 6a3 3 0 0 0 5 0l3-6M8 21h8" /></>,
  finance: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 10h18M7 16h3" /></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.5 2.5-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3.6v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L5.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4v-3.6h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L7.8 5l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3.7h3.6v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.5 2.5-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  "arrow-up": <><path d="M12 20V4M6 10l6-6 6 6" /></>,
  "arrow-right": <><path d="M4 12h16M14 6l6 6-6 6" /></>,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m5 5 14 14M19 5 5 19" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M21 20a5 5 0 0 0-4-4.9" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></>,
  truck: <><path d="M3 5h11v12H3zM14 9h4l3 3v5h-7z" /><circle cx="7" cy="19" r="2" /><circle cx="17" cy="19" r="2" /></>,
  paw: <><circle cx="7" cy="9" r="2" /><circle cx="17" cy="9" r="2" /><circle cx="5" cy="15" r="2" /><circle cx="19" cy="15" r="2" /><path d="M12 12c-3.2 0-5 3.2-4 5.6.8 1.9 2.1 3.4 4 3.4s3.2-1.5 4-3.4c1-2.4-.8-5.6-4-5.6Z" /></>,
  wrench: <><path d="M21 6.5a5 5 0 0 1-6.8 4.7L6 19.4a2.5 2.5 0 1 1-3.5-3.5l8.2-8.2A5 5 0 0 1 17.5 1l-3 3 .5 2.5 2.5.5 3-3c.3.8.5 1.7.5 2.5Z" /></>,
  bricks: <><path d="M3 5h7v5H3zM10 5h11v5H10zM3 10h12v5H3zM15 10h6v5h-6zM3 15h7v5H3zM10 15h11v5H10z" /></>,
  car: <><path d="m5 16 1.5-6h11L19 16" /><path d="M3 16h18v4H3zM6 20v1M18 20v1" /><circle cx="7" cy="18" r="1" /><circle cx="17" cy="18" r="1" /></>
};

export function Icon({ name, size = 20, strokeWidth = 1.8, filled = false }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {pathByIcon[name]}
    </svg>
  );
}
