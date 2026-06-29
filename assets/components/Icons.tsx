// src/components/Icons.tsx
// Reusable SVG icons (replace emoji usage). Recolor/resize via props.
import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export type IconProps = {
  color?: string;
  size?: number;
};

const base = (color: string, size: number, d: string) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d={d} />
  </Svg>
);

// 👤 person
export const PersonIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  );

// ⚙️ gear / settings
export const GearIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  );

// 📋 clipboard / orders
export const ClipboardIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
  );

// 📅 calendar
export const CalendarIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z',
  );

// 🔧 wrench / maintenance
export const WrenchIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
  );

// 🔔 bell
export const BellIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
  );

// ❄️ snowflake
export const SnowflakeIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z',
  );

// 🔒 lock
export const LockIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
  );

// ⚡ bolt / electrical
export const BoltIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M7 2v11h3v9l7-12h-4l4-8z');

// 💧 water drop / plumbing
export const DropIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z',
  );

// 🔨 hammer / carpentry
export const HammerIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M19.66 9.64L17.5 11.8 12.2 6.5l2.16-2.16c.58-.58.96-.34 1.14-.16l4 4c.77.77.56 1.06.16 1.46zM11.5 7.2l5.3 5.3-1.41 1.41-.7-.7-7.49 7.5c-.2.19-.46.29-.7.29-.26 0-.5-.1-.71-.29l-2.5-2.5c-.19-.21-.29-.45-.29-.71 0-.26.1-.5.29-.71l7.5-7.5-.7-.7L11.5 7.2z',
  );

// 🧱 brick wall / masonry
export const BrickIcon = ({ color = '#000', size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Rect x="2" y="4" width="9" height="5" rx="0.6" />
    <Rect x="13" y="4" width="9" height="5" rx="0.6" />
    <Rect x="2" y="10.5" width="4" height="5" rx="0.6" />
    <Rect x="8" y="10.5" width="8" height="5" rx="0.6" />
    <Rect x="18" y="10.5" width="4" height="5" rx="0.6" />
    <Rect x="2" y="17" width="9" height="5" rx="0.6" />
    <Rect x="13" y="17" width="9" height="5" rx="0.6" />
  </Svg>
);

// 📷 camera
export const CameraIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M12 15.2c1.77 0 3.2-1.43 3.2-3.2s-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2 1.43 3.2 3.2 3.2zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z',
  );

// 🖼️ image / gallery
export const ImageIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
  );

// 🎥 video camera
export const VideoIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
  );

// 📁 folder
export const FolderIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
  );

// ✕ close
export const CloseIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  );

// ▶ play
export const PlayIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M8 5v14l11-7z');

// ← arrow back
export const ArrowLeftIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z');

// → arrow forward
export const ArrowRightIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z');
